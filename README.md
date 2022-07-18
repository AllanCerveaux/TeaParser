# TeaParser

A simple template parser.

> This is package in WIP

[![NPM](https://img.shields.io/npm/v/tea-parser.svg)](https://www.npmjs.com/package/teaparser) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


## Install

```bash
npm install --save tea-parser
# or
yarn add --save tea-parser
```

## Usage

### Parse template file

With `tea-parser` you can parse a file, a filename or each file in template folder.

```javascript
import { Tea } from 'tea-parser'

Tea(template_file_path, destination_folder_path, data)
// Tea('./template/index.html', './dest', {foo: 'foo', bar: 'bar})
```


### Parse template folder

```javascript
import { Tea } from 'tea-parser'

Tea(template_folder_path, destination_folder_path, data)
// Tea('./template', './dest', {foo: 'foo', bar: 'bar})
```

### Template

To parse the template file, you write your template variable like this:

```html
<!-- HTML Template File -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ site_title }}</title>
</head>
  <body>
    <p>{{ site_content }}</p>
  </body>
</html>
```
To parse the filename, you can name it like this:

`{{filename}}.[ext]`

>example : 
>
>`{{template_name}}.json`

## License

MIT © [AllanCerveaux](https://github.com/AllanCerveaux)
