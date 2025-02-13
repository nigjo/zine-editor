# Zine Editor

<!--
<style>
  .page{
    font-family:sans-serif;
    &.page1 .content{
      display:flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-evenly;
      text-align:center;
      font-family:Consolas;
    }
    blockquote{
      margin-left:0mm;
      border-left:1mm solid silver;
      padding-left:2mm;
    }
  }
</style>
-->

a
Markdown/HTML based  
Zine editor

![Anleitung](zine-guide-b-w.png "height50")

## Markdown and HTML

Write some Markdown inside the HTML file. It will be converted into
HTML and be rendered in your Browser.

Write Text. Use images. Let your imagination flow.
As long as your Browser can display it, it is fine to use.

Each Page is a chapter of the markdown file.
The chapters title is used as a page title. You are free to leave the
title empty. It will not be inserted into the page.

## A local webserver

To load the Markdown file from your disc a webserver is needed. Any
server that can serve static files will do. May languages like Pyhton, PHP
or Java (18+) and many others do have this ability.

> If you are not able to run such a server you can edit the `index.hmtl`
> directly. Find the `id="zinecontent"` tag and write the markdown content
> there.

## CSS

CSS is used to "place" and size each page of your zine. Some classes can
be used to layout your pages.

You can place your own styles inside the markdown file. Just use
a pair of `<style></style>` tags. A good place is after the first
header at the beginning of the document.

> Wrap the styles in HTML comments to hide it in your own markdown processor.

## 

### Classes

`.page`
: Format all pages

`.page1`
: The title page

`.page8`
: The back page

`.content`
: The block inside a `.page` with the generated HTML.

```css
.page {
  &.page1 .content {
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly
  }
}
```


## Images

Image are sized to fit one page.

## 

TODO write content

##


This editor uses simple Browser features. Just open this HTML Page in
your Browser from a local path.

Sources:  
https://github.com/nigjo/

Title image author unknown

