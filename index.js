const playwright = require('playwright-chromium');
const PDFGenerator = require('pdfkit');
const fs = require('fs');

const PAGE_URL = 'https://sponsr.ru/feed';
const ARTICLES_FOLDER = 'feed/';
const STEP = 19;

async function main(existedArticleIds) {
	const browser = await playwright.chromium.launch({
		headless: false,
	});

	try {
		const context = await browser.newContext();
		const cookies = fs.readFileSync('cookies.json', 'utf8');

		const deserializedCookies = JSON.parse(cookies);
		await context.addCookies(deserializedCookies);
		const page = await context.newPage();

		await page.goto(PAGE_URL);

		let position = 0;
		let articles = await getNewArticles(page, position, existedArticleIds);
		while (articles.length > 0) {
			articles.forEach(generatePdf);
			console.log(`Generated pdfs for ${articles.length} articles`);
			await page.click('a#show-more');
			await page.waitForTimeout(5000);

			position += STEP + 1;
			articles = await getNewArticles(page, position, existedArticleIds);
		}
	} catch (error) {
		console.error(error);
	} finally {
		await browser.close();
	}
}

async function getNewArticles(page, position, existedArticleIds) {
	const to = position + STEP;
	const articlesSelector = `article.short-item:nth-child(n+${position}):nth-child(-n+${to})`;
	const elements = page.locator(articlesSelector);
	return await elements.evaluateAll((articleElements, existedArticleIds) => {
		return articleElements
			.map((el) => {
				const id = el.id;
				const stripUnicodeChars = (str) =>
					str.replace(/&lrm;|\u200F|\u200E/gi, '');
				const content = stripUnicodeChars(
					el.querySelector('.post-con').outerText
				);
				const parsedDate = el
					.querySelector('.post-data')
					.getAttribute('data-post_date');
				const date = parsedDate.slice(0, 10).replace(/\./g, '-');
				console.log(date);
				return {
					id,
					content,
					date,
				};
			})
			.filter((article) => {
				return article.id && !existedArticleIds.includes(article.id);
			});
	}, existedArticleIds);
}

function generatePdf(article) {
	const doc = new PDFGenerator();
	doc.registerFont('OpenSans', 'fonts/OpenSans-Regular.ttf');
	doc.font('OpenSans');
	doc.fontSize(14);
	doc.pipe(fs.createWriteStream(ARTICLES_FOLDER + `${article.id}.pdf`));
	doc.text(article.content, {
		align: 'justify',
	});
	doc.end();
}

const existedArticleIds = fs
	.readdirSync(ARTICLES_FOLDER)
	.filter((filename) => filename.endsWith('.pdf'))
	.map((filename) => filename.split('.')[0]);
main(existedArticleIds);
