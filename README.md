
# Final Project - Shortener50

### Shortener50

My Final project for CS50W is URL shortener web application. 

This project is built using **Django** Python Framework as a back-end, **Javascript** as a front-end programming language, **HTML** for markup and **CSS**, including some **Bootstrap v5** library for styling.  Django uses SQLite by default for storing information (Heroku deployment linked below, uses PostgreSQL). 

View Web app deployment on **Heroku** free hosting from [here](https://s50.herokuapp.com/) (It's free hosting, so it might be slow)

Youtube review: [watch](https://youtu.be/jgRprBIg0ZM)

#### Preview

![Preview Gif](https://github.com/rezi-gelenidze/CS50W-Projects/blob/master/Previews/FinalPreview.gif)

###  Distinctiveness and Complexity

My project - URL shortener, satisfies complexity  and distinctiveness requirements:

- It's is distinct from this course's previous projects. It is not E-commerce, Email system, Social network and etc.
- It uses Django framework as a back-end. It includes:
	- Authentication system.
	- Django models for database storage.
	- API for data fetching.
	- Django views and templates.
	- short URL redirection action.
- It uses Javascipt as a front-end, on link management panel. My Javascript code includes:
		- Responsive UI behaviors.
		- API calls with fetch (create, edit, delete and etc.) without reloading page, fetched data processing and page rendering.
		- Analytical calculations with fetch data.
		- Feeding and rendering page with data.
		- Generating QR code with qrcode.js
		- Feed with data and display pie chart with Chart.js
		- Create, Edit, Remove actions for short URL's
		- Search feature for created links (by title, link or id).
-  Web app is fully **mobile-responsive**.

Using this app, users can register, login and create short URLs for their original URLs. When user is logged in, he/she is an able to create, edit, remove, toggle link as (in)active, view some analytical data and statistics about links they created (clicks Pie chart, active links, total links and etc). When user navigates to the short URL, he/she is redirected to the original URL, that link creator has previously set. 

Each saved original link has unique 6 character random (a-zA-Z0-9) identifier,
when user browses `s50.herokuapp.com/Ca1kL0`, in this example **Ca1kL0** unique short link identifier is caught with regex, then app queries original URL from database and redirects user to that original link if it exists and is active (read below for more)


### Installation Guide
  -  `pip install -r requirements.txt` 
     for installing required python modules. 
  - make migrations and migrate with 
  `python manage.py makemigrations` then 
  `python manage.py migrate`.
  - run server with  `python manage.py runserver`

### Files
  - `shortly50` - Core web app directory.
	  -  `urls.py` contains url mapping.
	  -  `settings.py` contains web app settings.
	  - Other files are Django default

 - `shortener` - URL shortener  application directory
	 - `templates/shortener`
		 - `layout.html` General layout template
		 - `login.html` Login page markup
		 - `register.html` Register page markup
		 - `index.html` Index (not-authenticated) page markup
		 - `panel.html` Index (authenticated), link manager panel, 
		 page markup
		 - `error.html` Error page markup (404, 500, 403 and etc.)

	- `static/shortener`
		- `js`
			- `panel.js` Index panel JS for API calls, data fetch, rendering, responsive or other functional behaviors and etc. 
			- `qrcode.js` QRcode JS library file for generating short URL QR codes
		- `css`
			- `style-general.css` General website stylesheet
			- `style-index.css` Index page stylesheet
			- `style-panel.css` link management panel stylesheet
			- `style-auth.css` Auth (login/register) stylesheet
		- `img` Image directory that stores images that are used as website page content or titlebar icon
			- `easy.png`
			- `money.png`
			- `qrcodehand.png`
			- `link.svg`

- `urls.py` url route mapping for URL shortener app
- `models.py` file containing 2 declared models for URL shortener app
- `views.py` file containing view functions for URL shortener app
- `admin.py` file where models are registered for an admin page
- Other files are Django default

### models

1. `User` - Django default AbstractUser model

2. `Shorturl` - table for storing link data

| columns | type | description |
| -- | -- | -- |
| author | FK(User) | Link creator user |
| title | CharField | Link title for identifying it in the link manager panel |
| original | URLField | Original URL |
| short_id | CharField | 6 (A-Z a-z 0-9) character string for identifying short URL |
| date_created | DateTimeField | Link creation date |
| clicks | PositiveIntegerField | Link click (redirection) counter |
| active | BooleanField | Link active/inactive boolean |


### routes

- `/` Index page if not authenticated, or link management panel if unauthenticated

- `/[A-Za-z0-9]{6}` regex captures 6 character short link id
for  example, route `example.com/Cs50L2` will catch short link id '**Cs50L2**' in this example and redirect to the original URL which is linked with this short url ID.

- `/login` route for logging in user

- `/register` route for registering an user

- `/out` route for logging out user

APIs:
- `/linkdata`  API route for fetching all links JSON data that user has created (**GET**)
- `/new/<url_id>` API route for creating new link (**POST**)
- `/edit/<url_id>` API for editing (on **PUT** HTTP request) or removing (on **DELETE** HTTP request) link
- `/activeToggle` API for toggling link as active or inactive (**PUT**)

### Admin credentials (default one)

username: `admin`

password: `admin`

### The end
	
That was my final project, Thanks to CS50 and it's staff for their contribution on this golden learning resources. I have started with CS50T, then proceeded with CS50 and now I have finished CS50W. I have already gained so much knowledge, skills and experience to proceed diving more deeply in this bottomless and interesting world of computer science and programming that I already love so much. 

Rezi Gelenidze, 
16 years old from Georgia.
June 7, 2021
**This was CS50!**
