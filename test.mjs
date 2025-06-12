import playwright from "playwright";
import { playAudit } from "playwright-lighthouse";

const TRIALS = 25;

async function generatePage(pagelink, port) {
  const browser = await playwright.chromium.launch({
    args: ["--remote-debugging-port=" + port],
  });
  const page = await browser.newPage();
  await page.goto(pagelink);

  return { page, browser };
}

async function performTest(page, port) {
  const audit = await playAudit({
    page,
    port,
    thresholds: {
      performance: 0,
      accessibility: 0,
      "best-practices": 0,
      seo: 0,
      pwa: 0,
    },
  });

  return audit.lhr.categories.performance.score;
}

const googlePage = await generatePage(
  "https://scp-sandbox-3.wikidot.com/radian628:font-test-google",
  9222
);

const base64Page = await generatePage(
  "https://scp-sandbox-3.wikidot.com/radian628:font-test-base64",
  9223
);

console.log(
  "note: an additional dummy test is added at the beginning to cache resources. this test is not included"
);

const base64TestResults = [];
const googleTestResults = [];

for (let i = 0; i < TRIALS + 1; i++) {
  console.log("\n\n\n\nTRIAL", i + 1, "out of", TRIALS + 1, "================");
  console.log("\n\nPerforming google test...");
  const googleResult = await performTest(googlePage.page, 9222);
  console.log("\n\nPerforming base64 test...");
  const base64Result = await performTest(base64Page.page, 9223);
  googleTestResults.push(googleResult);
  base64TestResults.push(base64Result);
}

await googlePage.browser.close();
await base64Page.browser.close();

base64TestResults.shift();
googleTestResults.shift();

console.log("");
console.log("");
console.log("RESULTS BELOW:");
console.log("Base64 Test Results");
console.log("raw results:", JSON.stringify(base64TestResults));
console.log(
  "average:",
  base64TestResults.reduce((a, b) => a + b, 0) / base64TestResults.length
);
console.log("Google Test Results:");
console.log("raw results:", JSON.stringify(googleTestResults));
console.log(
  "average:",
  googleTestResults.reduce((a, b) => a + b, 0) / googleTestResults.length
);
