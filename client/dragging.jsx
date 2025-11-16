import Draggable from 'react-draggable';

const helper = require('./helper.js');
const React = require('react');
const {useState,useEffect} = React;
const {createRoot} = require('react-dom/client');
const reactDrag = require('react-draggable');

const DraggableThing = () => {
   return (
      <Draggable>
         <div>
            blaw
         </div>
      </Draggable>
   )
}