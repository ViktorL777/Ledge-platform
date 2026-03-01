import Parser from 'rss-parser';
import { createServerClient } from './supabase-server.js';

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'Ledge-Bot/1.0 (leadership intelligence platform)' }
});

export async function fetchRSSFeeds(supabase) {
  const { data: sources, error } = await supabase
    .from('sources')
    .select('*')
    .eq('is_active', true)
    .not('rss_url', 'is', null);

  if (error) throw new Error(`Failed to fetch sources: ${error.message}`);

  const allArticles = [];

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.rss_url);
      const articles = (feed.items || []).slice(0, 10).map(item => ({
        source_id: source.id,
        source_name: source.name,
        title: item.title?.trim() || '',
        lead: (item.contentSnippet || item.content || '').slice(0, 500).trim(),
        url: item.link || item.guid || '',
        og_image_url: item.enclosure?.url || extractImageFromContent(item.content) || null,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      }));
      allArticles.push(...articles.filter(a => a.title && a.url));
    } catch (err) {
      console.warn(`RSS fetch failed for ${source.name}: ${err.message}`);
    }
  }

  return allArticles;
}

function extractImageFromContent(html) {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/);
  return match ? match[1] : null;
}

export async function deduplicateArticles(supabase, articles) {
  const urls = articles.map(a => a.url);
  
  const { data: existing } = await supabase
    .from('raw_articles')
    .select('url')
    .in('url', urls);

  const existingUrls = new Set((existing || []).map(e => e.url));
  return articles.filter(a => !existingUrls.has(a.url));
}

export async function storeRawArticles(supabase, articles) {
  if (articles.length === 0) return [];

  const { data, error } = await supabase
    .from('raw_articles')
    .insert(articles.map(a => ({
      source_id: a.source_id,
      title: a.title,
      lead: a.lead,
      url: a.url,
      og_image_url: a.og_image_url,
      published_at: a.published_at,
      is_processed: false
    })))
    .select();

  if (error) throw new Error(`Failed to store raw articles: ${error.message}`);
  return data;
}

const CLASSIFICATION_SYSTEM_PROMPT = `You are the classification engine for Ledge, a leadership intelligence platform. Your job is to evaluate incoming content and determine:
1. Is this relevant to leadership practice? (relevance score 1-10)
2. Which primary dimension does it belong to?
3. Which related dimensions does it connect to?

RELEVANCE THRESHOLD: Only content scoring 8 or above is worth surfacing.
Be selective. A score of 8 means: a senior leader would stop scrolling to read this. It offers actionable insight, a strategic pattern, a provocation, or a decision-relevant data point.

THE 8 DIMENSIONS:
1. MEANING-MAKER — The "Why?" Purpose, meaning, values, vision, mission, North Star.
2. STRATEGIST — "How do we achieve the vision?" Strategy, planning, tactics, patterns.
3. TECH-SAVVY — The tool dimension. AI, robotics, tech ecosystems, human-machine relationship.
4. OPERATOR — "How does it become reality?" Processes, execution, lean, agile.
5. RELATIONSHIP-WEAVER — Personal connections. Conflict, influence, negotiation, networks.
6. CULTURE-ARCHITECT — Community dimension. Org culture, org design, collaboration.
7. SELF-AWARENESS — Leader's inner world. True Self, resilience, mindset.
8. TRANSFORMATOR — Time dimension. Change, transformation, M&A, innovation cycles.

CLASSIFICATION RULES:
- Assign exactly ONE primary dimension
- Assign 0-2 related dimensions
- AI/intelligent machines integration is relevant across ALL dimensions
- If inner work serves a strategic goal → Strategist (primary)
- If content is about execution methodology → Operator

RESPOND IN JSON ONLY. No explanation, no preamble. Format:
{"relevance":9,"primary":"Strategist","related":["Tech-Savvy"],"reason":"brief reason","angle_hint":"one-sentence editorial hook or null"}`;

export async function classifyArticle(article) {
  const userMessage = `Classify this content:
SOURCE: ${article.source_name || 'Unknown'}
TITLE: ${article.title}
LEAD: ${article.lead || 'No lead available'}
TYPE: article`;

  const response = await callAnthropic({
    model: 'claude-haiku-4-5-20251001',
    maxTokens: 300,
    system: CLASSIFICATION_SYSTEM_PROMPT,
    userMessage
  });

  try {
    const jsonStr = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.warn(`Failed to parse classification for: ${article.title}`);
    return { relevance: 0, primary: 'Unknown', related: [], reason: 'Parse error', angle_hint: null };
  }
}

const LEADERSHIP_ANGLE_SYSTEM_PROMPT = `You are the editorial voice of Ledge, a leadership intelligence platform. You write the Leadership Angle: a 4-5 sentence original editorial perspective on each curated article.

YOUR VOICE:
You are a business leader who works in human-centered AI transformation, leadership development, and organizational development. Your thinking is naturally informed by psychology, philosophy, and theology — but you never name-drop these disciplines explicitly. They show up as depth, not as labels. You are equally passionate about technology, data, and natural science as you are about human depth.

THE METAPHOR:
Classic three-piece suit with a pocket watch chain — but the watch strap is orange, and so are the socks. Professional, serious about the craft, deeply knowledgeable. But with an unexpected twist that signals: this person thinks, not just performs.

THE 7 RULES:
1. GENTLE PROVOCATION — Challenge assumptions gently. Reframe, don't attack.
2. QUESTIONS PRESENT, NOT DOMINANT — Maximum one question per Angle. Most sentences declarative.
3. ALWAYS INCLUDE DATA — At least one concrete data point with source attribution. Non-negotiable.
4. ENERGETIC, PLAYFUL, CREATIVE — BUT PROFESSIONAL. Like a brilliant dinner conversation.
5. EXISTENTIAL COURAGE — Say what most business commentary avoids. Admit uncertainty.
6. DEPTH WOVEN IN NATURALLY — Never name-drop Tillich, Frankl etc. Embody the thinking.
7. BUSINESS LEADER, NOT PREACHER — Never preach, lecture, or coach. Business language with deeper layers.

ANTI-PATTERNS (NEVER DO THESE):
- Generic opinions anyone could write
- No data, just feelings
- Question bombardment (more than 1 question)
- Academic name-dropping
- Preaching or moralizing
- Mere summary of the article
- Starting with "In today's..." or "In an era of..." or "This is a reminder that..."
- Using "navigate", "landscape", "paradigm shift", "game-changer", "double-edged sword"
- Starting with a rhetorical question

OPENING VARIETY RULES:
- Start with a concrete fact or number (40% of angles)
- Start with a bold declarative statement (30% of angles)
- Start with an unexpected analogy or observation (20% of angles)
- Start with a short, punchy sentence (10% of angles)
- NEVER start two consecutive angles the same way

RESPOND IN JSON ONLY:
{"leadership_angle":"your 4-5 sentence angle here","data_source":"source of the data point used","tone_check":"one of: gentle_provocation, playful_reframe, data_driven_insight, existential_honesty, creative_connection","tags":["#tag1","#tag2"]}`;

export async function generateLeadershipAngle(article, classification) {
  const userMessage = `Write a Leadership Angle for this article:
SOURCE: ${article.source_name || 'Unknown'}
TITLE: ${article.title}
LEAD: ${article.lead || 'No lead available'}
PRIMARY_DIMENSION: ${classification.primary}
RELATED_DIMENSIONS: ${(classification.related || []).join(', ')}
ANGLE_HINT: ${classification.angle_hint || 'none'}`;

  const response = await callAnthropic({
    model: 'claude-sonnet-4-5-20250929',
    maxTokens: 600,
    system: LEADERSHIP_ANGLE_SYSTEM_PROMPT,
    userMessage
  });

  try {
    const jsonStr = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.warn(`Failed to parse Leadership Angle for: ${article.title}`);
    return null;
  }
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80)
    .replace(/-+$/, '');
}

async function callAnthropic({ model, maxTokens, system, userMessage }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userMessage }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

export async function runPipeline() {
  const supabase = createServerClient();
  const log = {
    articles_fetched: 0,
    articles_classified: 0,
    articles_passed: 0,
    articles_curated: 0,
    used_data_sources: [],
    errors: []
  };

  const { data: batch } = await supabase
    .from('batch_log')
    .insert({ status: 'running' })
    .select()
    .single();

  try {
    console.log('Fetching RSS feeds...');
    const rawArticles = await fetchRSSFeeds(supabase);
    log.articles_fetched = rawArticles.length;
    console.log(`Found ${rawArticles.length} articles`);

    const newArticles = await deduplicateArticles(supabase, rawArticles);
    console.log(`${newArticles.length} new articles (${rawArticles.length - newArticles.length} duplicates skipped)`);

if (newArticles.length === 0) {
      console.log('No new articles to process');
      await updateBatchLog(supabase, batch.id, log, 'completed');
      return { success: true, ...log, message: 'No new articles' };
    }

    const BATCH_SIZE = 10;
    const articleBatch = newArticles.slice(0, BATCH_SIZE);
    console.log(`Processing ${articleBatch.length} of ${newArticles.length} new articles`);

    const stored = await storeRawArticles(supabase, articleBatch);
    console.log(`Stored ${stored.length} raw articles`);

    console.log('Classifying articles...');
    const classified = [];
    for (const article of stored) {
      const sourceInfo = newArticles.find(a => a.url === article.url);
      const classification = await classifyArticle({
        ...article,
        source_name: sourceInfo?.source_name || 'Unknown'
      });
      
      classified.push({ article, classification, source_name: sourceInfo?.source_name });
      log.articles_classified++;

      await supabase.from('classified_articles').insert({
        raw_article_id: article.id,
        relevance_score: classification.relevance,
        primary_dimension: classification.primary,
        related_dimensions: classification.related || [],
        reason: classification.reason,
        angle_hint: classification.angle_hint
      });

      await supabase.from('raw_articles').update({ is_processed: true }).eq('id', article.id);

      await sleep(200);
    }
    console.log(`Classified ${classified.length} articles`);

    const relevant = classified.filter(c => c.classification.relevance >= 7);
    log.articles_passed = relevant.length;
    console.log(`   ${relevant.length} articles passed relevance threshold (≥7)`);

    console.log('Generating Leadership Angles...');
    for (const item of relevant) {
      const angle = await generateLeadershipAngle(
        { ...item.article, source_name: item.source_name },
        item.classification
      );

      if (angle) {
        const slug = generateSlug(item.article.title);
        
        await supabase.from('curated_articles').insert({
          raw_article_id: item.article.id,
          title: item.article.title,
          lead: item.article.lead,
          source_name: item.source_name || 'Unknown',
          source_url: '',
          article_url: item.article.url,
          og_image_url: item.article.og_image_url,
          published_at: item.article.published_at,
          primary_dimension: item.classification.primary,
          related_dimensions: item.classification.related || [],
          relevance_score: item.classification.relevance,
          leadership_angle: angle.leadership_angle,
          data_source: angle.data_source,
          tone_check: angle.tone_check,
          tags: angle.tags || [],
        status: 'published',
          slug
        });

        log.articles_curated++;
        if (angle.data_source) log.used_data_sources.push(angle.data_source);
      }

      await sleep(500);
    }

    await updateBatchLog(supabase, batch.id, log, 'completed');

    return { success: true, ...log };

  } catch (err) {
    log.errors.push(err.message);
    await updateBatchLog(supabase, batch?.id, log, 'failed', err.message);
    return { success: false, error: err.message, ...log };
  }
}

async function updateBatchLog(supabase, batchId, log, status, errorLog = null) {
  if (!batchId) return;
  await supabase.from('batch_log').update({
    finished_at: new Date().toISOString(),
    articles_fetched: log.articles_fetched,
    articles_classified: log.articles_classified,
    articles_passed: log.articles_passed,
    articles_curated: log.articles_curated,
    used_data_sources: log.used_data_sources,
    status,
    error_log: errorLog
  }).eq('id', batchId);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
