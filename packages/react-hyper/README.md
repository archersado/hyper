
<h1 align="center"> a react bridge for hyper render, you can drawing complex graphics by using react</h1>

> To help build an Graphic based application effectively, we make a react custom render to connect Hyper engine and react application

### Feature

* 基础图形组件的支持，能够通过 jsx 语法高效书写，并且能够轻松完成事件的处理
* 通过基础组件的组合，能够以 react 组件的方式轻松自定义一个组件
* 基于 react reconciler，在处理大量图形元素时获得更强的性能
* 支持图形元素的层级嵌套自动成组，以及位置次序的自动计算


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