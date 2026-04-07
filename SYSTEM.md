                           ┌──────────────────────────┐
                           │       CLIENT USER        │
                           │  Marketing / SEO / PR    │
                           └────────────┬─────────────┘
                                        │
                                        ▼
                           ┌──────────────────────────┐
                           │    QOTEON WEB APP        │
                           │  Next.js Dashboard       │
                           │  Reports / Recommendations│
                           └────────────┬─────────────┘
                                        │ API
                                        ▼
                    ┌────────────────────────────────────────┐
                    │         APPLICATION BACKEND            │
                    │            FastAPI / API               │
                    │                                        │
                    │ - auth / tenancy                       │
                    │ - project management                   │
                    │ - scoring APIs                         │
                    │ - reporting APIs                       │
                    │ - managed-service workspace            │
                    └───────┬───────────────┬────────────────┘
                            │               │
                            │               │
                            ▼               ▼
              ┌─────────────────────┐   ┌─────────────────────┐
              │   JOB ORCHESTRATOR  │   │   REAL-TIME CACHE   │
              │ Celery / Workers    │   │ Redis               │
              │ Scheduled scans     │   │ queue / cache       │
              └───────┬─────────────┘   └─────────────────────┘
                      │
                      ▼
     ┌──────────────────────────────────────────────────────────────────┐
     │                        PROCESSING LAYER                          │
     │                                                                  │
     │  1. Prompt Runner                                                │
     │  2. Web Crawler / Source Scanner                                 │
     │  3. Entity Extraction                                            │
     │  4. Mention Detection                                            │
     │  5. Ranking / Scoring Engine                                     │
     │  6. Recommendation Engine                                        │
     │  7. Report Generator                                             │
     └───────┬─────────────────────┬──────────────────────┬─────────────┘
             │                     │                      │
             │                     │                      │
             ▼                     ▼                      ▼
   ┌─────────────────┐   ┌──────────────────┐   ┌─────────────────────┐
   │ LLM CONNECTORS  │   │ SOURCE INGESTION │   │ CONTENT ANALYZER    │
   │ ChatGPT         │   │ client site      │   │ page audits         │
   │ Gemini          │   │ competitor sites │   │ content gaps        │
   │ Claude          │   │ directories      │   │ schema checks       │
   │ Perplexity      │   │ reviews/forums   │   │ topic coverage      │
   └────────┬────────┘   └────────┬─────────┘   └──────────┬──────────┘
            │                     │                        │
            └──────────────┬──────┴──────────────┬─────────┘
                           ▼                     ▼
                 ┌──────────────────┐   ┌──────────────────────┐
                 │   POSTGRES DB    │   │ OBJECT STORAGE (S3)  │
                 │ structured data  │   │ raw HTML / JSON      │
                 │ scores / prompts │   │ model response dumps │
                 │ accounts         │   │ generated reports    │
                 └────────┬─────────┘   └──────────────────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ VECTOR / SEARCH  │
                 │ pgvector first   │
                 │ OpenSearch later │
                 └──────────────────┘



### ELI5
Qoteon wants to know how visible a brand is inside AI answers.

# Prompt Library
  - It creates, organizes, and prioritizes the questions Qoteon will ask AI systems to measure brand visibility.
     - It stores reusable prompt blueprints.
       Example: What are the best {{category}} tools for {{persona}}?
     - It turns those blueprints into real prompts for one project.
       Example: (given category = AI visibility platforms and persona = brand marketers) 
           - What are the best AI visibility platforms for brand marketers?
     - It organizes the prompt.  It labels them by:
       - intent
       - cluster
       - funnel stage
       - priority
     - It picks which prompts to run.
       Example:
         - baseline_scan = broad first scan
         - monthly_tracking = smaller stable set for recurring monitoring
         - experiment_set = custom prompts for testing ideas
# Prompt Runner 
  - Does the asking.
     - It takes a bunch of saved prompts like “What are the best running shoes?” and sends them to AI models like ChatGPT, Claude, or Gemini. Then it saves what each AI answered, keeps track of whether each request worked or failed, retries when something temporary breaks, and hands the results to the next part of Qoteon that checks things like