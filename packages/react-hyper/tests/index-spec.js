import React, { useCallback } from 'react';
import { mount } from 'enzyme';


import Board, { Component } from '../lib/core';

const { Rect, Image } = Component;
function App() {
    return (
      <div id="app">
        <Board engineType="fabric" config={{ container: 'container' }} width={1000} height={500}>
          <Rect width={100} height={100} left={0} top={0} fill="red" 
            onSelected={useCallback((...args) => {console.log('selected', this, args)}, [])} 
            onMoving={useCallback(() => {console.log('moving')}, [])} 
            onMoved={useCallback(() => {console.log('moved')}, [])}  
          />
          <Image async src="https://img.alicdn.com/imgextra/i3/O1CN01EFF4Wv1xVgvxRayF9_!!6000000006449-0-tps-194-259.jpg" onMoving={() => {console.log('moving')}} width={picWidth} height={200} left={0} top={0} fill="red" />
        </Board>
        <Button onClick={widthChange}>变宽</Button>
        <Button onClick={() => {setShowImage(true)}}>出现</Button>
      </div>
  
    );
}
describe('Test references', function () {
    let instance;
    const wrapper = mount(<App />);
    instance = wrapper.instance();
});
