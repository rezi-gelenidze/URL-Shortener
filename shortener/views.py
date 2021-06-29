from django.conf.urls import url
from django.db.models.query import QuerySet
from django.http.response import HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
import json
import random
import string

from .models import User, Shorturl

def index(request, url_id=None):
    if request.method == 'GET':
        if url_id:
            # if url id is passed query short url data
            query = Shorturl.objects.filter(short_id=url_id).first()

            # if url exists and is active, redirect to it and increment click counter
            if query and query.active:
                url = query.original

                query.clicks += 1
                query.save()

                return HttpResponseRedirect(url)
            else:
                # return error message
                return render(request, 'shortener/error.html', {
                    'message': 'Requested link does not exist or not active.'
                })
        else:
            # if short id is not passed, render panel or index page
            if request.user.is_authenticated:
                return render(request, 'shortener/panel.html')
            else:
            # if user is unauth, render index page
                return render(request, 'shortener/index.html')


# APIs
@login_required(login_url='/login')
def userlinksdata(request):
    ''' return user links' data for rendering panel page '''
    if request.method == 'GET':
        data = Shorturl.objects.filter(author=request.user)
        return JsonResponse({ k: link.serialize() for (k, link) in zip(range(len(data)), data)})


@login_required(login_url='/login')
def edit(request, url_id=None):
    '''
        edit or delete link via API

        edit on PUT request type
        remove on DELETE request type
    '''
    # get query and check it request sender is author
    query = Shorturl.objects.filter(pk=url_id).first()
    if query and request.user != query.author:
        return JsonResponse({}, status=403)

    if request.method == 'PUT':
        # load data
        data = json.loads(request.body)
        new_title = data['title']
        new_original = data['original']

        # edit post data
        if new_title and new_original and query:
            try:
                query.title = new_title
                query.original = new_original
                query.save()

                return JsonResponse({'message':'Link has successfully updated.'}, status=204)
            except:
                return JsonResponse({'message':'Internal server error.'}, status=500)
        else:
            return JsonResponse({'message':'Invalid request.'}, status=400)
    elif request.method == 'DELETE':
        try:
            query.delete()

            return JsonResponse({'message':'Link has successfully removed.'}, status=204)
        except:
            return JsonResponse({'message':'Internal server error.'}, status=500)


@login_required(login_url='/login')
def activetoggle(request, url_id=None):
    if request.method == 'PUT':
        query = Shorturl.objects.filter(pk=url_id).first()

        if query:
            # check if request sender is author
            if request.user != query.author:
                return JsonResponse({}, status=403)

            # toggle active status
            try:
                if query.active:
                    query.active = False
                else:
                    query.active = True
                query.save()

                return JsonResponse({}, status=204)
            except:
                return JsonResponse({}, status=500)


def new(request):
    ''' create new link API '''
    if request.method == 'POST':
        data = json.loads(request.body)
        title = data['title']
        original = data['original']

        # check if maximum 500 link limit is not crossed
        count = Shorturl.objects.filter(author=request.user).count()

        if count >= 500:
            return JsonResponse({}, status=400)

        if title and original:
            # generate random id
            chars = string.ascii_letters + string.digits
            while True:
                rand_id = ''.join(random.choice(chars) for i in range(6))
                if not Shorturl.objects.filter(short_id=rand_id).first():
                    break
            # save new link
            try:
                new_link = Shorturl(
                    author=request.user,
                    title=title,
                    original=original,
                    short_id=rand_id
                )
                new_link.save()

                return JsonResponse({}, status=201)
            except:
                return JsonResponse({}, status=500)
        else:
            return JsonResponse({}, status=400)


# Auth
@login_required(login_url='/login')
def logout_view(request):
    logout(request)
    return redirect('index')


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # match passwords
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "shortener/register.html", {
                "message": "Passwords must match."
            })

        # Try creating new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "shortener/register.html", {
                "message": "Username already taken."
            })
        
        # login after succesful register
        login(request, user)
        return redirect('index')
    else:
        return render(request, "shortener/register.html")


def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return redirect("index")
        else:
            return render(request, "shortener/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "shortener/login.html")


def error404(request, exception):
    return render(request, 'shortener/error.html', {
        'code':404,
        'message':'Requested page not found.'
    })


def error403(request, exception):
    return render(request, 'shortener/error.html', {
        'code':403,
        'message':'access is forbidden'
    })


def error400(request, exception):
    return render(request, 'shortener/error.html', {
        'code':400,
        'message':'Bad request'
    })


def error500(request):
    return render(request, 'shortener/error.html', {
        'code':500,
        'message':'Internal server error.'
    })
