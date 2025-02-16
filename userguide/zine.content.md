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
    p:has(img.center){text-align: center;}
    a{text-decoration:none;}
  }
  @media print{
    .page{
      a{color:inherit;}
    }
  }
</style>
-->

A  
Markdown/Browser  
based Zine creator

![graphical guide](zine-guide-b-w.png "height50")

## Markdown and HTML

Write some Markdown and drag it to the editor.
It will be converted into HTML and be rendered in your Browser.

Write Text. Use images. Let your imagination flow.
As long as your Browser can display it, it is fine to use.

Each Page is a chapter of the markdown file.
The chapters title is used as a page title. You are free to leave the
title empty. It will not be inserted into the page.

## A local webserver

If used offline, the editor works best with a local webserver.
Any server that can serve static files will do.
Tools like Python, PHP or Java (18+) and many others do have this ability.

> Without a server you can edit the `index.hmtl` directly.
> Find the `id="zinecontent"` tag and write the markdown content there.

## Custom Styles

CSS is used to "place" and size each page of your zine. Some classes can
be used to layout your pages.

You can place your own styles inside the markdown file. Just use
a pair of `<style></style>` tags. A good place is after the first
header at the beginning of the document.

> Wrap the styles in HTML comments to hide it in your own markdown processor.

## Editor styles

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

Image are sized to fit a pages width.

This tool utilizes the markdown "title" of an image to simulation CSS classes.
These classes can be used to "shrink" the image even more.

Use `width50` to limit the width to 50% of the page. More sizes are
`25`, `33`, `50`, `66` or `75`.

Use "Custom Styles" to do more image styling.

## Printing

Your zine can be printed on DIN/ISO A4 or US Letter sizes sheets of paper.
Select your favourite size on the top of the editor.

Use the default printing function of your browser. Select the right paper size
and set the "border size" to "none".

Most browsers have an option to "save as PDF".
This is great to distribute your zine to the world.

##


**Zine editor**

&copy; 2025 by Nigjo Iqn

Licence: Apache 2.0

Sources:  
`https://github.com/nigjo/zine-editor/`

markdown-it, MIT license  
`https://github.com/markdown-it/`

Title image by
[Daisy Wakefield](https://www.42ndstreet.org.uk/support/read/how-to-make-your-own-zine/)

![a book with a 'Ta da' cover](book.png "center width33")
