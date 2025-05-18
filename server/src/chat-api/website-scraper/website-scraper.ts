import puppeteer from "puppeteer";

/**
 * Scrapes the given website URL and returns a list of emails found on the page.
 * @param url The website URL to scrape.
 * @returns Promise<string[]> List of emails found.
 */
export async function scrapeEmailsFromWebsite(url: string): Promise<string[]> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    const pageContent = await page.content();

    // Regex to extract emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = pageContent.match(emailRegex) || [];

    // Remove duplicates
    const uniqueEmails = Array.from(new Set(emails));
    return uniqueEmails;
  } catch (error) {
    console.error("Error scraping website:", error);
    return [];
  } finally {
    await browser.close();
  }
}

/**
 * Scrapes the given website URL and returns a list of phone numbers found on the page.
 * @param url The website URL to scrape.
 * @returns Promise<string[]> List of phone numbers found.
 */
export async function scrapePhonesFromWebsite(url: string): Promise<string[]> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    const pageContent = await page.content();

    // Regex to extract phone numbers (simple international and local formats)
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/g;
    const phones = pageContent.match(phoneRegex) || [];

    // Remove duplicates and filter out numbers that are too short (less than 7 digits)
    const uniquePhones = Array.from(new Set(phones)).filter(
      (num) => num.replace(/\D/g, "").length >= 7
    );
    return uniquePhones;
  } catch (error) {
    console.error("Error scraping website:", error);
    return [];
  } finally {
    await browser.close();
  }
}

/**
 * Scrapes the given website URL and returns a list of all image URLs found on the page.
 * @param url The website URL to scrape.
 * @returns Promise<string[]> List of image URLs found.
 */
export async function scrapeImagesFromWebsite(url: string): Promise<string[]> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Get all image src attributes from the page
    const imageUrls = await page.$$eval('img', imgs =>
      imgs.map(img => (img as HTMLImageElement).src)
    );

    // Remove duplicates and empty strings
    const uniqueImages = Array.from(new Set(imageUrls)).filter(Boolean);
    return uniqueImages;
  } catch (error) {
    console.error("Error scraping images from website:", error);
    return [];
  } finally {
    await browser.close();
  }
}
