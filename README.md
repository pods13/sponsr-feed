# Sponsr-Feed-Parser

[Sponsr](https://sponsr.ru/) feed parser, which saves feed's posts to pdfs.

## Requirements

The parser expects cookie.json file with the cookie information of the [Sponsr](https://sponsr.ru/) in order to authenticate parser requests. This [extension](https://chrome.google.com/webstore/detail/%E3%82%AF%E3%83%83%E3%82%AD%E3%83%BCjson%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E5%87%BA%E5%8A%9B-for-puppet/nmckokihipjgplolmcmjakknndddifde?hl=en) can be used to get _cookie.json_

## Usage

```
npm start
```

## Results

Creates `pdf` per each post in a folder _feed_.
