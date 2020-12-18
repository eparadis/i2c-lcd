# i2c-lcd

An [Adafruit MakeCode](https://makecode.adafruit.com/) extension to allow the use of the [Adafruit I2C LCD Backpack](https://www.adafruit.com/product/292) on a [2-line Character LCD](https://www.adafruit.com/product/181).

In a pinch, you could use it with [a 4-line display](https://www.adafruit.com/product/198), but you'd have to write really long strings to "overflow" into the second and fourth lines of the display.

A single-line display should also work if you just only ever write to the "first" line.

Similarly, while it's designed to work with displays that are 16 characters wide, wider displays will work other than the `Clear` method only clearing the first 16 characters. All it's doing is writing 16 spaces to the specified line, so you could replicate that in your own MakeCode projects. Narrower displays will work fine.

Automatic scrolling isn't supported, but could be added.

Displaying the cursor (blinking or otherwise) isn't supported, but could also be added.

Moving the cursor to specific positions isn't supported, but could also be added. (Seeing a pattern?)

This project was written for [HCDE 539](http://www.washington.edu/students/crscat/hcde.html#hcde539) at the [University of Washington Masters in Human Centered Design and Engineering](https://www.hcde.washington.edu/ms) by Ed Paradis in the Autumn 2020 quarter.

## Instructions

1. Open up [Adafruit MakeCode](https://makecode.adafruit.com/) and go to the "Home" page
2. Click on "Import"
3. Click on "Import URL..."
4. In the URL box, paste `https://github.com/eparadis/i2c-lcd` and click "Go Ahead!"
5. Go back to the "Home" page.
6. Start a New Project
7. Click on Advanced -> Extensions
8. There you should see "i2c-lcd" labeled "Local copy of eparadis/i2c-lcd#master" click that
9. Now you'll have an "LCD" option in the toolbox of blocks to use in your projects!

## TODO, if this is ever going to make it into the "official" list of extensions

- [ ] Add a reference for your blocks here
- [ ] Add "icon.png" image (300x200) in the root folder
- [ ] Add "- beta" to the GitHub project description if you are still iterating it.
- [ ] Turn on your automated build on https://travis-ci.org
- [ ] Use "pxt bump" to create a tagged release on GitHub
- [ ] On GitHub, create a new file named LICENSE. Select the MIT License template.
- [ ] Get your package reviewed and approved https://makecode.adafruit.com/extensions/approval

Read more at https://makecode.adafruit.com/extensions

## Supported targets

* for PXT/codal
(The metadata above is needed for package search.)

