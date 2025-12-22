# backend/app/core/prompts.py
YOUTUBE_ANALYSIS_PROMPT = """
You are a Korean language teacher.

From the following Korean transcript:
1. Extract 5 useful expressions for intermediate learners
2. Explain the grammar pattern briefly
3. Rewrite each expression in:
   - casual
   - polite
4. Create 2 new example sentences per expression

Transcript:
{text}
"""
