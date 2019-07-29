# Image Annotation Using Polygons 

This open source tool was developed by two Cardiff University interns to build a dataset of annotated images - which will eventually be used to contribute to machine learning models.

## Introduction

Image annotation is a human intensive task that is in the core of almost every computer vision project, 
currently most tools available are either ready made tools incorporated in a jobs platform like Amazon Mturk
or simple tools that rely on bounding boxes, our tool allows researchers to upload their datasets on whatever platform they wish and get annotators (from any platform) to annotate their images for them, the data is then exported for the researcher to use in their models.

## Features 
- Researcher signup and login.
- Adding datasets with a possible restriction on annotations wanted.
- Adding and sharing surveys with annotators on different platforms
- Directory of currently available datasets
- Image polygon annotation tool

## File Structure

This is a nodejs with expressJS project, the file structure here is as simple as it gets

- Package.json : Nodemodules needed to run the project
- Database.js : Schemes and connection information of MongoDB using mongoose.
- App.js : Main file for the application, has includes and uses.
- views : EJS files.
- public : Javascript file for the annotation page and CSS files for the ESJ files.
- routes : Index.js includes all the routing logic for the website.
- config : Holds config data for the environment (currently only database configuration)

## How to use

### For localhost
- Run this command "npm install"
- Edit the config variables in the .env file to fit your database connection
- Run this command "nodemon start"