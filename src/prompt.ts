//with sites to learn about a technology

const prefix = ["Top", "Best"];
const num = [5];

const tools = [
    //   "AI tools",
    "resources",
    "websites",
    "tutorials",
    "youtube channels",
    "github repos",
    //   "cheat sheets",
    //   "platforms",
    //   "frameworks",
    //   "libraries",
    //   "technologies",
    //   "languages",
    //   "books",
    //   "podcasts",
    //   "blogs",
    //   "bootcamps",
    //   "hackathons",
    //   "games",
    //   "projects",
];

const verbs = [
    "to learn",
    "to master",
    "to become an expert in",
    "to become a pro in",
    "to become a master in",
];

const frameworks = [
    "JavaScript",
    "ReactJS",
    "NodeJS",
    "HTML",
    "CSS",
    "Angular",
    "Vue",
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "Web Development",
    "Web Design",
    "Programming",
    "Coding",
    "Software Engineering",
    "Software Development",
    "Computer Science",
    "Computer Programming",
    "Solidity",
    "Blockchain",
    "Smart Contracts",
    "Ethereum",
    "Bitcoin",
    "Artificial Intelligence",
    "Python",
    "Java",
    "C++",
    "C",
    "SQL",
    "Go",
    "Rust",
    "TypeScript",
    "React Native",
    "Flutter",
];

const random = (array: Array<any>) => {
    return array[Math.floor(Math.random() * array.length)];
};

const generatePromptTech = () => {
    const p = random(prefix);
    const a = random(num);
    const b = random(tools);
    const c = random(verbs);
    const d = random(frameworks);

    const tweet = `${p} ${a} ${b} ${c} ${d}!`;
    return tweet;
};

const tools2 = [
    "AI Tools",
    "HTML-CSS Templates",
    "Free Icons Website",
    // "Learn JS/CSS by playing games",
    "CSS Frameworks",
    // "Find your next remote jobs",
];

//with tools and websites
const saveYou = [
    "that will save you 100s of hours",
    "that will save you 100s of hours of work",
    "that will save you 100s of hours of studying",
    "that will save you 100s of hours of research",
    "that will save you 100s of hours of googling",
    "that will save you 100s of hours of searching",
    "that you cannot miss",
    "that you cannot miss out on!",
];

const generatePromptTools = () => {
    const b = random(tools2);
    const c = random(saveYou);

    const tweet = `5 ${b} ${c}!`;
    return tweet;
};

export { generatePromptTech, generatePromptTools };
/*
still remaining - HTML/CSS Templates, Free Icons Website, Learn JS/CSS by playing games, CSS Frameworks, find your next remote jobs, repos for interview prep, GPT-4 launched just 12 hours ago and people are already doing mind-blowing things with it.Check out these examples in this thread: , learn for free in 2023:html-html.com  css -css-tricks.com ... ,
what are you learning currently, are you learning js/frontend/webd - say hi

Your task is to help a tech Twitter account create a tweet for their tech Twitter audience, providing the name of the resources/tools/websites, just names and nothing else. The list generated should include good tools, not just famous ones. Research and generate properly.
Keep the tweet directly to the point and add "⚡" as the bullet point for each item in the generated list.

Keep the format of the output like this:
Hook
List generated

Improvise the hook to make it more catchy and do not add any emojis to it.

Write the tweet based on the hook provided in the hook delimited by triple backticks.

Use at most 260 characters.
Do not use hashtags.

Hook: ```10 AI tools that will save you 100s of hours of work!```

OBSERVATIONS:
1. not good with cheat sheets - just provides random names, links needed
2. if asked to add links - too much of messy content
3. when copied, comes in the form of a para, so need to give proper line breaks before tweeting
4. sometimes including the term 'hook' in the tweet and double quotes on the hook, so need to remove it. also remove hashtags at the end if any.
5. need to give a line break between the hook and the list.

a lil improvised v

Your task is to help a tech Twitter account create a tweet for their tech Twitter audience, providing the name of the resources/tools/websites, just names and nothing else. The list generated should include good tools, not just famous ones. Research and generate properly.
Keep the tweet directly to the point and add "⚡" as the bullet point for each item in the generated list.

Keep the format of the output like this:
Hook
List generated

Improvise the hook to make it more catchy and do not add any emojis to it.
Strictly keep the hook upto 60 characters.
End the hook with a "🚀" or "⚒" or "💻" emoji.

Write the tweet based on the hook provided in the hook delimited by triple backticks.

Use at most 260 characters.
Do not use hashtags.

Hook: ```Best 10 youtube channels to become a pro in Full Stack Development```

TOO-MANY REQUESTS FOR NOW - TODO: FEW SHOT PROMPTING, GIVE EXAMPLES IN THE PROMPT EVERYTIME.

v3

Your task is to help a tech Twitter account create a tweet for their tech Twitter audience, providing the name of the resources/tools/websites, just names and nothing else. The list generated should include good tools, not just famous ones. Research and generate properly.
Keep the tweet directly to the point and add "⚡" as the bullet point for each item in the generated list.

Improvise the hook to make it more catchy and do not add any emojis to it.
Strictly keep the hook up to 60 characters. Do not generate any text except what is provided in the hook below, just improvise that.
End the hook with a "🚀" or "⚒" or "💻" emoji.

Keep the format of the output like this:
Hook
List generated

Write the tweet based on the hook provided in the hook delimited by triple backticks.

Use at most 260 characters.
Do not use hashtags.

Hook: ```Top 10 resources to become an expert in C++!```
*/
