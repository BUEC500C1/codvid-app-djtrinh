# codvid-app-djtrinh
codvid-app-djtrinh created by GitHub Classroom

# Introduction
In this homework, we will be creating a react native application to query and plot Covid 19 information is real-time.

## Steps 1 and 2
We the first two steps require setting up the react native development environment. This involves installing Android Studio, Node.js and other
dependencies.

The following command is to initialize the example project

```python
npx react-native init AwesomeProject
```

After creating the example project directory, we go ahead and run the next two commands to run the reactive native project.

```python
cd AwesomeProject
npx react-native start
```

<img src = "https://github.com/BUEC500C1/codvid-app-djtrinh/blob/master/imgs/img1.PNG">

```python
cd AwesomeProject
npx react-native run-android
```

<img src = "https://github.com/BUEC500C1/codvid-app-djtrinh/blob/master/imgs/img2.PNG">

<img src = "https://github.com/BUEC500C1/codvid-app-djtrinh/blob/master/imgs/img3.PNG">

## Step 3

The following command is to install the maps apit

```python
npm install react-native-maps --save-exact
```
App.js was modified to show a map. Google API keys were also generated and pushed into the AndroidManifest.xml file.

We can then run the application the same way again.
```python
cd maps
npx react-native start
```

```python
cd maps
npx react-native run-android
```

<img src = "https://github.com/BUEC500C1/codvid-app-djtrinh/blob/master/imgs/img4.PNG">
