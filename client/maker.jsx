const helper = require('./helper.js');
const React = require('react');
const {useState,useEffect} = React;
const {createRoot} = require('react-dom/client');

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrag } from 'react-dnd';
import { useDrop } from 'react-dnd';

const handleDomo = (e, onDomoAdded) => {
   e.preventDefault();
   helper.hideError();

   const name = e.target.querySelector('#domoName').value;
   const age = e.target.querySelector('#domoAge').value;
   const height = e.target.querySelector('#domoHeight').value;
   const x = innerWidth/2;
   const y = innerHeight/2;

   if(!name || !age || !height){
      helper.handleError('all fields required');
      return false;
   }
   helper.sendPost(e.target.action, {name, age, height , x , y}, onDomoAdded);
   return false;
};

const DomoForm = (props) => {
   return (
      <form id ="domoForm"
         name="domoForm"
         onSubmit={(e) => handleDomo(e,props.triggerReload)}
         action="/maker"
         method='POST'
         className='domoForm'
      >
         <label htmlFor='name'>Name: </label>
         <input id='domoName' type='text' name='name' placeholder='Domo Name'/>
         <label htmlFor='age'>Age: </label>
         <input id='domoAge' type='number' name='age' min="0"/>
         <label htmlFor='Height'>Height: </label>
         <input id='domoHeight' type='number' name='height' min="0"/>
         <input className='makeDomoSubmit' type='submit' value="Make Domo" />
      </form>
   )
};
function DomoDragging({domo, children}) {
  const [{isDragging}, drag] = useDrag(() => ({
    type: "DOMO",
    item: {id: domo._id},
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      style={{
        position: "absolute",
        left: domo.x,
        top: domo.y,
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab", //cool little styling thing i found
      }}
    >
      {children}
    </div>
  )
}

const ScreenDropLayer = ({ onDrop, children }) => {
  const [, dropRef] = useDrop(() => ({
    accept: "DOMO",
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset) return;

      onDrop(item.id, offset.x, offset.y);
    },
  }));

  return (
    <div
      ref={dropRef}
      style={{
        position: "fixed",
        inset: 0,
      }}
    >
      {children}
    </div>
  );
};



const DomoList = (props) => {
   const [domos, setDomos] = useState(props.domos);

  useEffect(() => {
  const loadDomosFromServer = async () => {
    const response = await fetch('/getDomos');
    const data = await response.json();

   const merged = data.domos.map(d => {
   const pos = props.positions[d._id] || { x: 20, y: 20 };
   return {
      _id: d._id,
      name: d.name,
      age: d.age,
      height: d.height,
      x: pos.x,
      y: pos.y,
   };
   });


    setDomos(merged);
  };
  loadDomosFromServer();
}, [props.reloadDomos, props.positions]);

   if(domos.length === 0){
      return (
         <div className="domoList">
            <h3 className='emptyDomo'>No Domos Yet</h3>
         </div>
      );
   }

   const domoNodes = domos.map(domo => {
      return (
         <DomoDragging key={domo._id} domo={domo}>
            <div className="domo">
            <img src="/assets/img/domoface.jpeg" alt='domo face' className='domoFace'/>
            <h3 className='domoName'>Name: {domo.name}</h3>
            <h3 className='domoAge'>Age: {domo.age}</h3>
            <h3 className='domoHeight'>Height: {domo.height}</h3>
            </div>
         </DomoDragging>
      );
   });

   return(
      <div className='domoList'>
         {domoNodes}
      </div>
   );
}

const App = () => {
  const [reloadDomos, setReloadDomos] = useState(false);
  const [positions, setPositions] = useState({}); // store id → {x,y}

  const moveDomo = (id, x, y) => {
    setPositions(prev => ({ ...prev, [id]: { x, y } }));
  };

  return (
    <ScreenDropLayer onDrop={moveDomo}>
      <DomoForm triggerReload={() => setReloadDomos(!reloadDomos)} />
      <DomoList domos={[]} reloadDomos={reloadDomos} positions={positions}/>
    </ScreenDropLayer>
  );
};

const init = () => {
   const root = createRoot(document.getElementById('app'));
   root.render(
    <DndProvider backend={HTML5Backend}>
      <App/>
    </DndProvider>
  );
}

window.onload = init;