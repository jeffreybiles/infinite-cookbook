This is an "infinite cookbook", which generates and updates recipes for the user based on their preferences.

The goals of this project are to:
* create a realistic LLM-first app
* familiarize myself with the Python ecosystem
* deploy with AWS and terraform

This contains two parts:
1. NextJS frontend
  * Go to /frontend folder
  * Run `npm install && npm run dev`
2. FastAPI backend
  * Go to /backend folder
  * Run `pip install -r requirements.txt && uvicorn main:app --reload`
  * OR run `docker build -t infinite_cookbook_dev -f Dockerfile.dev . && docker run -p 8000:8000 -v  ~/.aws:/root/.aws  infinite_cookbook_dev/`

NextJS was chosen because it was familiar and I do not want to learn anything new on the frontend for this project.  If deploying to AWS is too much of a pain, I may switch to Remix or plain React.  I could have also done the LLM API calls in NextJS backend endpoints, but I want to familiarize myself with the Python ecosystem, since most ML and AI is done there.

**At the current stage, this app does not follow best software-engineering practices!**

# How to run

### Backend

Requirements:
* Python must be installed
* Postgres must be running at localhost:5432

First, create the file `backend/.env` and put in the `GROQ_API_KEY` (sign up at https://groq.com/)

Then install the required packages and start running the app.  Python must be installed.

```
$ cd backend
$ pip install -r requirements.txt
$ python scripts/create_db.py
$ alembic upgrade head
$ uvicorn main:app --reload
```

To test, go to localhost:8000/docs and you should see a set of FastAPI endpoints listed

If this doesn't work, it's possible that I skipped a step in the instructions (it's been 8 years since I did production Python).  If you know what the skipped step is, please open a PR updating this readme!


### Frontend

```
$ cd frontend
$ npm install
$ npm run dev
```

# Plan

We will use LLM generation for the following:
* Generating the initial recipe ideas
* Generating the initial recipes
* Generating/choosing the edit suggestions
* Updating the recipes
* Checking for validity

There will also use other AI tools, such as scraping to find recipes on a specific web page.

A system of preferences will be saved that helps generate foods more in line with the user's wants.  Currently it will be set directly by the user, but in the future we could create a memory system that updates preferences based on the actions the user takes within the app.