import React, { useState, useCallback } from 'react';
import { Button } from '@alife/hippo';
import Board, { Component } from './core';
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
