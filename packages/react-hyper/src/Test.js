
import { Component } from './core';

const { Rect, Group, Text, Image } = Component;


function Test() {

  return (
         <Group left={200} top={200} onMoving={() => {console.log('moving');}}>
          <Rect width={50} height={50} left={0} top={0} fill="grey" zIndex={10}>
              {/* <Text text="hello world" textAlign="center" fill="#000" zIndex={100}/> */}
         </Rect>              
          <Image async src="https://img.alicdn.com/imgextra/i2/O1CN01DDZz8A2A7UzkRqMQl_!!6000000008156-2-tps-560-280.png" width={200} height={100}>
            <Text text="你好" textAlign="center" fill="#000" zIndex={100}/>
          </Image>
        </Group>

  );
}

export default Test;
