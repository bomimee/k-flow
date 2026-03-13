import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
service_key: str = os.getenv("SUPABASE_SERVICE_KEY") or key

if not url or not service_key:
    print("Missing Supabase credentials.")
    exit(1)

supabase: Client = create_client(url, service_key)

ttmik_grammar_data = [
    # Level 1
    {
        "title": "안녕하세요 / 감사합니다",
        "level": 1,
        "meaning": "Hello / Thank you",
        "description": "The most fundamental greetings in Korean. '안녕하세요' is used to say Hello, Good morning, Good afternoon, or Good evening. '감사합니다' is the standard and polite way to say Thank you.",
        "formation": [
            {"text": "안녕하세요 (An-nyeong-ha-se-yo) - Hello"} ,
            {"text": "감사합니다 (Gam-sa-ham-ni-da) - Thank you"}
        ],
        "examples": [
            {"korean": "안녕하세요. 저는 학생입니다.", "english": "Hello. I am a student.", "notes": ""},
            {"korean": "도와주셔서 감사합니다.", "english": "Thank you for helping me.", "notes": ""}
        ],
        "quiz": {
            "question": "Which of the following means 'Thank you' in Korean?",
            "options": ["안녕하세요", "사랑해요", "감사합니다", "미안해요"],
            "answer": 2
        },
        "related_youtube_clip": None
    },
    {
        "title": "-요/이에요/예요",
        "level": 1,
        "meaning": "To be (am, are, is)",
        "description": "These are the polite endings for the verb 'to be' (이다). Use '이에요' after nouns ending in a consonant, and '예요' after nouns ending in a vowel.",
        "formation": [
            {"rule": "Noun ending in consonant", "result": "+ 이에요", "example": "학생 + 이에요 = 학생이에요 (I am a student)"},
            {"rule": "Noun ending in vowel", "result": "+ 예요", "example": "의사 + 예요 = 의사예요 (I am a doctor)"}
        ],
        "examples": [
            {"korean": "저는 한국 사람이에요.", "english": "I am a Korean person.", "notes": "사람 ends in ㅁ (consonant)"},
            {"korean": "이거는 사과예요.", "english": "This is an apple.", "notes": "사과 ends in ㅏ (vowel)"}
        ],
        "quiz": {
            "question": "Which ending is correct for '물' (water)?",
            "options": ["물예요", "물이예요", "물이에요", "물요"],
            "answer": 2
        },
        "related_youtube_clip": None
    },
    {
        "title": "이, 그, 저",
        "level": 1,
        "meaning": "This, That, That (over there)",
        "description": "'이' is used for things near the speaker. '그' is used for things near the listener or previously mentioned. '저' is used for things far from both speaker and listener.",
        "formation": [
            {"rule": "Near speaker", "result": "이 + Noun", "example": "이 사람 (This person)"},
            {"rule": "Near listener", "result": "그 + Noun", "example": "그 책 (That book)"},
            {"rule": "Far from both", "result": "저 + Noun", "example": "저 차 (That car over there)"}
        ],
        "examples": [
            {"korean": "이것은 무엇입니까?", "english": "What is this thing?", "notes": "이 + 것 (thing)"},
            {"korean": "저 사람은 누구예요?", "english": "Who is that person over there?", "notes": "저 + 사람"}
        ],
        "quiz": {
            "question": "If an object is far from both you and the person you are talking to, which word should you use?",
            "options": ["이", "그", "저", "요"],
            "answer": 2
        },
        "related_youtube_clip": None
    },
    {
        "title": "아니에요",
        "level": 1,
        "meaning": "To not be",
        "description": "The opposite of 이다 (to be) is 아니다 (to not be). In polite present tense, it is conjugated as '아니에요'. It requires the subject marker 이/가 before it.",
        "formation": [
            {"rule": "Noun ending in a consonant", "result": "+ 이 아니에요", "example": "학생이 아니에요 (I am not a student)"},
            {"rule": "Noun ending in a vowel", "result": "+ 가 아니에요", "example": "의사가 아니에요 (I am not a doctor)"}
        ],
        "examples": [
            {"korean": "저는 한국 사람이 아니에요.", "english": "I am not a Korean person.", "notes": "사람 ends with consonant 'ㅁ', so we use '이'."},
            {"korean": "이것은 제 책이 아니에요.", "english": "This is not my book.", "notes": ""}
        ],
        "quiz": {
            "question": "How do you say 'It is not a cat (고양이)'?",
            "options": ["고양이 아니에요", "고양이가 아니에요", "고양이이 아니에요", "고양이에요"],
            "answer": 1
        },
        "related_youtube_clip": None
    },
    {
        "title": "은/는",
        "level": 1,
        "meaning": "Topic marking particles",
        "description": "Used to mark the topic of a sentence. It can act as a contrast marker or to state a general fact.",
        "formation": [
            {"rule": "Noun ending in a consonant", "result": "+ 은", "example": "사람 + 은 = 사람은"},
            {"rule": "Noun ending in a vowel", "result": "+ 는", "example": "사과 + 는 = 사과는"}
        ],
        "examples": [
            {"korean": "저는 학생이에요.", "english": "As for me, I am a student.", "notes": "저 ends in a vowel, so '는' is used."},
            {"korean": "이 책은 좋아요.", "english": "This book is good (as opposed to others).", "notes": ""}
        ],
        "quiz": {
            "question": "Which particle is used after '오늘' (today)?",
            "options": ["가", "는", "은", "를"],
            "answer": 2
        },
        "related_youtube_clip": None
    },
    {
        "title": "이/가",
        "level": 1,
        "meaning": "Subject marking particles",
        "description": "Used to emphasize the subject of the sentence, often answering 'who' or 'what'.",
        "formation": [
            {"rule": "Noun ending in a consonant", "result": "+ 이", "example": "책 + 이 = 책이"},
            {"rule": "Noun ending in a vowel", "result": "+ 가", "example": "차 + 가 = 차가"}
        ],
        "examples": [
            {"korean": "비가 와요.", "english": "It is raining (The rain is coming).", "notes": ""},
            {"korean": "누가 책을 샀어요?", "english": "Who bought the book?", "notes": "누구 + 가 = 누가"}
        ],
        "quiz": {
            "question": "Which particle goes with '시간' (time) in the phrase 'Do you have time?' (시간_ 있어요?)",
            "options": ["가", "를", "이", "는"],
            "answer": 2
        },
        "related_youtube_clip": None
    },
    {
        "title": "있어요 / 없어요",
        "level": 1,
        "meaning": "To have / to exist OR To not have / to not exist",
        "description": "'있다' means to exist or to have something. '없다' is its direct opposite, meaning something does not exist or someone doesn't have something.",
        "formation": [
            {"rule": "Noun + 이/가", "result": "있어요", "example": "돈이 있어요 (I have money)"},
            {"rule": "Noun + 이/가", "result": "없어요", "example": "시간이 없어요 (I don't have time)"}
        ],
        "examples": [
            {"korean": "저는 질문이 있어요.", "english": "I have a question.", "notes": ""},
            {"korean": "사과가 없어요.", "english": "There are no apples. / I don't have apples.", "notes": ""}
        ],
        "quiz": {
            "question": "Which means 'I don't have money'?",
            "options": ["돈이 있어요", "돈이 아니에요", "돈이 없어요", "돈은 없어요"],
            "answer": 2
        },
        "related_youtube_clip": None
    },
    
    # Level 2
    {
        "title": "-고 싶어요",
        "level": 2,
        "meaning": "I want to...",
        "description": "This structure is used attached to verb bases to express the speaker's desire to do an action. For third-person, '-고 싶어하다' is used.",
        "formation": [
            {"rule": "Verb stem", "result": "+ 고 싶어요", "example": "가다 (to go) -> 다 Drop -> 가고 싶어요"}
        ],
        "examples": [
            {"korean": "한국에 가고 싶어요.", "english": "I want to go to Korea.", "notes": ""},
            {"korean": "피자를 먹고 싶어요.", "english": "I want to eat pizza.", "notes": ""}
        ],
        "quiz": {
            "question": "How do you say 'I want to sleep' using 자다(to sleep)?",
            "options": ["자고 싶어요", "자 싶어요", "잘 싶어요", "자고 있어요"],
            "answer": 0
        },
        "related_youtube_clip": None
    },
    {
        "title": "-아요 / -어요 / -여요",
        "level": 2,
        "meaning": "Present tense verb conjugation",
        "description": "Standard polite present tense in Korean. Conjugation depends on the last vowel of the verb stem.",
        "formation": [
            {"rule": "Verb stem ends in ㅏ or ㅗ", "result": "+ 아요", "example": "가다 -> 가요, 보다 -> 봐요"},
            {"rule": "Verb stem ends in other vowels", "result": "+ 어요", "example": "먹다 -> 먹어요"},
            {"rule": "Verb ends in 하다", "result": "-> 해요", "example": "공부하다 -> 공부해요"}
        ],
        "examples": [
            {"korean": "저는 점심을 먹어요.", "english": "I eat lunch.", "notes": "먹다 + 어요"},
            {"korean": "친구가 한국어를 공부해요.", "english": "My friend studies Korean.", "notes": "공부하다 -> 해요"}
        ],
        "quiz": {
            "question": "How do you conjugate '마시다' (to drink) in present tense?",
            "options": ["마시어요", "마사요", "마셔요", "마시요"],
            "answer": 2
        },
        "related_youtube_clip": None
    },
    {
        "title": "안 / -지 않다",
        "level": 2,
        "meaning": "Not (Negation)",
        "description": "Used to negate verbs and adjectives. '안' is placed before the verb, whereas '-지 않다' is attached to the verb stem (slightly more formal).",
        "formation": [
            {"rule": "Short form", "result": "안 + Verb", "example": "안 먹어요 (I do not eat)"},
            {"rule": "Long form", "result": "Verb stem + 지 않다", "example": "먹지 않아요 (I do not eat)"}
        ],
        "examples": [
            {"korean": "오늘 학교에 안 가요.", "english": "I'm not going to school today.", "notes": ""},
            {"korean": "이 영화는 재미있지 않아요.", "english": "This movie is not interesting.", "notes": "재미있다 + 지 않아요"}
        ],
        "quiz": {
            "question": "What is the short negation for '해요' (do)?",
            "options": ["지 않해요", "안 해요", "안해요", "해요 안"],
            "answer": 1
        },
        "related_youtube_clip": None
    },
    {
        "title": "-고 있다",
        "level": 2,
        "meaning": "Present progressive (am/are/is ...ing)",
        "description": "Attached to a verb stem to show that an action is currently ongoing.",
        "formation": [
            {"rule": "Verb stem", "result": "+ 고 있다", "example": "하다 -> 하고 있어요 (I am doing)"}
        ],
        "examples": [
            {"korean": "지금 음악을 듣고 있어요.", "english": "I am listening to music now.", "notes": "듣다 + 고 있어요"},
            {"korean": "친구가 기다리고 있어요.", "english": "My friend is waiting.", "notes": ""}
        ],
        "quiz": {
            "question": "Which of these means 'I am studying'?",
            "options": ["공부하고 싶어요", "공부했어요", "공부해요", "공부하고 있어요"],
            "answer": 3
        },
        "related_youtube_clip": None
    },
    
    # Level 3
    {
        "title": "-아/어/여서",
        "level": 3,
        "meaning": "Because, so, and then",
        "description": "Connects two clauses, showing cause & effect or a sequence of related events in chronological order.",
        "formation": [
            {"rule": "Same conjugation as present tense", "result": "Replace 요 with 서", "example": "가요 -> 가서 (go and then / because I go)"}
        ],
        "examples": [
            {"korean": "비가 와서 집에 있어요.", "english": "Because it's raining, I stayed home.", "notes": "Cause > Effect"},
            {"korean": "공원에 가서 책을 읽을 거예요.", "english": "I'll go to the park and then read a book.", "notes": "Chronological sequence"}
        ],
        "quiz": {
            "question": "Which connects '바빠요' (busy) + '못 가요' (can't go)?",
            "options": ["바쁘고 못 가요", "바빠서 못 가요", "바쁜데 못 가요", "바쁠 못 가요"],
            "answer": 1
        },
        "related_youtube_clip": None
    },
    {
        "title": "-(을) 수 있다/없다",
        "level": 3,
        "meaning": "Can / Cannot do something",
        "description": "Expresses ability or possibility to perform an action.",
        "formation": [
            {"rule": "Verb stem ending in vowel", "result": "+ ㄹ 수 있다", "example": "가다 -> 갈 수 있어요"},
            {"rule": "Verb stem ending in consonant", "result": "+ 을 수 있다", "example": "먹다 -> 먹을 수 없어요"}
        ],
        "examples": [
            {"korean": "한국어를 할 수 있어요?", "english": "Can you speak Korean?", "notes": "하다 (to do) + ㄹ 수 있다"},
            {"korean": "매운 음식을 먹을 수 없어요.", "english": "I cannot eat spicy food.", "notes": ""}
        ],
        "quiz": {
            "question": "How do you say 'I can read' (읽다 = to read)?",
            "options": ["읽를 수 있어요", "읽을 수 있어요", "읽 수 있어요", "읽고 있어요"],
            "answer": 1
        },
        "related_youtube_clip": None
    },
    {
        "title": "-(으)면",
        "level": 3,
        "meaning": "If / When",
        "description": "Used to express a condition ('If...') or a time when something happens ('When...').",
        "formation": [
            {"rule": "Verb stem ending in vowel", "result": "+ 면", "example": "오다 -> 오면 (If/when someone comes)"},
            {"rule": "Verb stem ending in consonant", "result": "+ 으면", "example": "먹다 -> 먹으면 (If/when someone eats)"}
        ],
        "examples": [
            {"korean": "내일 비가 오면, 집에 있을 거예요.", "english": "If it rains tomorrow, I'll stay home.", "notes": ""},
            {"korean": "시간이 있으면 같이 영화 볼까요?", "english": "If you have time, shall we watch a movie together?", "notes": ""}
        ],
        "quiz": {
            "question": "Which means 'If it's expensive (비싸다)'?",
            "options": ["비싸으면", "비싸면", "비쌌면", "비써면"],
            "answer": 1
        },
        "related_youtube_clip": None
    },
    {
        "title": "-아/어/여야 되다/하다",
        "level": 3,
        "meaning": "Must / Have to",
        "description": "Expresses obligation or necessity. '하다' or '되다' can be used interchangeably, though '되다' is more common in spoken Korean.",
        "formation": [
            {"rule": "Present tense conjugation without 요", "result": "+ 야 되다 / 하다", "example": "가다 -> 가야 돼요 (I have to go)"}
        ],
        "examples": [
            {"korean": "내일 일찍 일어나야 돼요.", "english": "I have to wake up early tomorrow.", "notes": "일어나다 -> 일어나야 돼요"},
            {"korean": "숙제를 먼저 해야 합니다.", "english": "I must do my homework first.", "notes": "하다 -> 해야 합니다"}
        ],
        "quiz": {
            "question": "How do you say 'I must study'? (공부하다 -> ?)",
            "options": ["공부해야 돼요", "공부하면 돼요", "공부할 돼요", "공부하고 돼요"],
            "answer": 0
        },
        "related_youtube_clip": None
    }
]

def seed_grammar():
    print(f"Adding {len(ttmik_grammar_data)} grammar points to Supabase.")
    success_count = 0
    for g in ttmik_grammar_data:
        # check if exists first
        res = supabase.table("grammar_points").select("*").eq("title", g["title"]).execute()
        if len(res.data) > 0:
            print(f"Skipping '{g['title']}' (already exists).")
        else:
            insert_res = supabase.table("grammar_points").insert(g).execute()
            print(f"Inserted: {g['title']}")
            success_count += 1
    
    print(f"Seed complete. Inserted {success_count} new grammar points.")

if __name__ == "__main__":
    seed_grammar()
