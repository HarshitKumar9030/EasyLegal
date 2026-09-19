import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import { generateObject } from 'ai';
import { z } from 'zod';
import { google } from '@ai-sdk/google';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function performLegalResearch(issue: string, facts: string[], jurisdiction: any) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Generate search queries using Gemini
    const { object: queryObj } = await generateObject({
      model: google('gemini-3.8-flash'),
      schema: z.object({
        queries: z.array(z.string()).max(3),
        siteFilters: z.string().describe("Search engine site filters for official government/legal sites in this jurisdiction (e.g., 'site:gov.in OR site:indiacode.nic.in' for India, 'site:gov' for US, 'site:gov.uk' for UK)"),
      }),
      system: `You are a legal research assistant. Based on the case facts and jurisdiction, generate 2-3 specific search queries to find relevant laws, acts, constitution, or official government guidelines.
Focus on official sources for the specific country/jurisdiction (e.g., government websites, official legal codes, constitution).`,
      prompt: `Issue: ${issue}\nJurisdiction: ${JSON.stringify(jurisdiction)}\nFacts: ${JSON.stringify(facts)}`,
    });

    const allSources = [];

    // 2. Execute searches and scrape content
    for (const query of queryObj.queries) {
      console.log(`Searching for: ${query} ${queryObj.siteFilters}`);
      
      // Using DuckDuckGo HTML for easier scraping
      await page.goto(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' ' + queryObj.siteFilters)}`);
      
      const html = await page.content();
      const $ = cheerio.load(html);
      
      const links: { title: string; url: string }[] = [];
      $('.result__a').each((i, el) => {
        if (i < 2) { // Get top 2 results per query
          links.push({
            title: $(el).text(),
            url: $(el).attr('href') || '',
          });
        }
      });

      for (const link of links) {
        if (!link.url || link.url.includes('duckduckgo.com')) continue;
        
        try {
          console.log(`Visiting: ${link.url}`);
          // Add a timeout and wait until domcontentloaded to speed things up
          await page.goto(link.url, { timeout: 15000, waitUntil: 'domcontentloaded' });
          
          // Extract readable text
          const pageHtml = await page.content();
          const page$ = cheerio.load(pageHtml);
          
          // Remove scripts, styles, nav, etc.
          page$('script, style, nav, header, footer, iframe, noscript').remove();
          const textContent = page$('body').text().replace(/\s+/g, ' ').trim().substring(0, 15000); // Limit text length

          if (textContent.length > 500) {
            // 3. Analyze content with Gemini to extract legal sources
            const { object: extractedSources } = await generateObject({
              model: google('gemini-3.8-flash'),
              schema: z.object({
                sources: z.array(z.object({
                  title: z.string(),
                  authority: z.string(),
                  source_type: z.string(),
                  jurisdiction: z.string(),
                  provision: z.string(),
                  relevant_excerpt: z.string(),
                  relevance_explanation: z.string(),
                })),
              }),
              system: `You are a legal analyst. Extract relevant legal provisions, acts, or rules from the provided text that relate to the user's case.
Only extract actual legal sources mentioned in the text. Do not invent anything.
Explain in plain language why it matters to the case.`,
              prompt: `Case Issue: ${issue}\nCase Facts: ${JSON.stringify(facts)}\n\nSource URL: ${link.url}\nSource Title: ${link.title}\n\nText Content:\n${textContent}`,
            });

            for (const source of extractedSources.sources) {
              allSources.push({
                ...source,
                url: link.url,
                retrieved_at: new Date(),
              });
            }
          }
        } catch (err) {
          console.error(`Failed to scrape ${link.url}:`, err);
        }
      }
    }

    return allSources;
  } finally {
    await browser.close();
  }
}