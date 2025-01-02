This is an "infinite cookbook", which generates and updates recipes for the user based on their preferences.

The goals of this project are to:
* create a realistic LLM-first app
* familiarize myself with the Python ecosystem
* deploy with AWS and terraform

This contains two parts:
1. NextJS frontend
2. FastAPI backend

NextJS was chosen because it was familiar and I do not want to learn anything new on the frontend for this project.  If deploying to AWS is too much of a pain, I may switch to Remix or plain React.  I could have also done the LLM API calls in NextJS backend endpoints, but I want to familiarize myself with the Python ecosystem, since most ML and AI is done there.

---

We will use LLM generation for the following:
* Generating the initial recipes
* Generating/choosing the edit suggestions
* Updating the recipes
* Checking for validity

There will also be light tool use:
* Scraping to find recipes on a specific page given to it
* Send email with recipe to the user (or this could just be a regular email handler?)

We will create a memory system to save preferences.  It could be just a prompt that is updated, but it could also be structured.  The structure I'm thinking of is an array of ingredient likes/dislikes, spice/flavor preference ratings, and an array of dietary restrictions.  This will be updated automatically by the edits they choose.
