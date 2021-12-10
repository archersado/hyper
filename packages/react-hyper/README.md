
<h1 align="center"> a react bridge for hyper render</h1>

> To help build an Graphic based application effectively, we make a react custom render to connect Hyper engine and react application

## Features

* Base graphic components support by using jsx snippets and easily events bindings 
* Custom your own react component by composing the base graphic components
* Get better performance base on react reconciler when dealing with thousands of graphic elements
* Nested elements in a group will be gathered together and their position will be updated automatically


## Usage

```jsx
import React, { useState, useCallback } from 'react';
import { Button } from '@alife/hippo';
import Board, { Component } from '@hset/react-hyper';
import Test from './Test';
import './App.css';

const { Rect, Image, Group } = Component;


function App() {
  const [picWidth, setPicWidth] = useState(100);
  const [showImage, setShowImage] = useState(true);
  const widthChange = () => {
    setPicWidth(200)
    setShowImage(false);
  }

  return (
    <div id="app">
      <Board engineType="fabric" config={{ container: 'container' }} width={1000} height={500}>
        <Rect width={100} height={100} left={0} top={0} fill="red" 
          onSelected={useCallback((...args) => {console.log('selected', this, args)}, [])} 
          onMoving={useCallback(() => {console.log('moving')}, [])} 
          onMoved={useCallback(() => {console.log('moved')}, [])}  
        />
        <Image async src="https://img.alicdn.com/imgextra/i3/O1CN01EFF4Wv1xVgvxRayF9_!!6000000006449-0-tps-194-259.jpg" onMoving={() => {console.log('moving')}} width={picWidth} height={200} left={0} top={0} fill="red" />
        {
          showImage && <Test/>
        }

      </Board>
      <Button onClick={widthChange}>变宽</Button>
      <Button onClick={() => {setShowImage(true)}}>出现</Button>
    </div>

  );
}

export default App;
```

## Author

👤 **archersado**


## Show your support

Give a ⭐️ if this project helped you!