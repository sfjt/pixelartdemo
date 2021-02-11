/**
 * To execute UI tests,
 * - add ChromeDriver to your PATH
 * - start the webpack dev server
 * - npm run test-uismoke
*/
const path = require('path');
const fs = require('fs');
const webdriver = require('selenium-webdriver');
const { Builder, By, until } = webdriver;
const capabilities = webdriver.Capabilities.chrome();

(async () => {
  const driver = await new Builder().withCapabilities(capabilities).build();
  await driver.get('http://localhost:8080/');
  const eventHolder = await driver.findElement(By.id('px-editor-event-holder'));
  const actions = driver.actions({ async: true });

  await actions.move({ origin: eventHolder }).press().move({ origin: eventHolder, x: 90, y: 30 }).perform();
  await actions.move({ origin: eventHolder, x: -30, y: -30 }).press().move({ origin: eventHolder, x: 60, y: -30 }).perform();
  const resizeToolButton = await driver.findElement(By.id('px-editor-tool-resize'));
  const inputX = await driver.findElement(By.id('px-editor-input-resize-x'));
  const inputY = await driver.findElement(By.id('px-editor-input-resize-y'));
  const resizeExecuteButton = await driver.findElement(By.id('px-editor-execute-resize'));
  const undoButton = await driver.findElement(By.id('px-editor-tool-undo'));
  resizeToolButton.click();
  await driver.wait(until.elementIsVisible(inputX));
  await driver.wait(until.elementIsVisible(inputY));
  await driver.wait(until.elementIsVisible(resizeExecuteButton));
  await inputX.clear();
  await inputX.sendKeys('12');
  await inputY.clear();
  await inputY.sendKeys('25');
  await resizeExecuteButton.click();
  await driver.wait(until.elementIsNotVisible(inputX));
  await driver.wait(until.elementIsNotVisible(inputY));
  await driver.wait(until.elementIsNotVisible(resizeExecuteButton));
  await resizeToolButton.click()
  await driver.wait(until.elementIsVisible(inputX));
  await driver.wait(until.elementIsVisible(inputY));
  await driver.wait(until.elementIsVisible(resizeExecuteButton));
  await inputX.clear();
  await inputX.sendKeys('20');
  await resizeExecuteButton.click();
  await undoButton.click();
  const picture = await driver.findElement(By.xpath('//canvas[contains(@style, "z-index: 11")]'))
  const data = await driver.executeScript('return arguments[0].toDataURL("image/png")', picture);

  const p = path.resolve(__dirname, 'data', 'uismoke.json');
  const s = await fs.promises.readFile(p, 'utf-8');
  const expected = JSON.parse(s).expected;
  if (data === expected) {
    console.log('Pass');
  } else {
    console.log('Fail');
    console.log('Displaying actual data');
    console.log(data)
  }
  driver.quit();
})()
