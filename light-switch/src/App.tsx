import { useEffect, useState } from 'react';
import './App.css'

function App() {
  const [mouseDown, setMouseDown] = useState(false);
  const [mousePosition, setMousePosition] = useState({x: 0, y: 0});
  const [oldAngle, setOldAngle] = useState(0);
  const [count, setCount] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [layer, setLayer] = useState(0);
  const MAX_ROTATION = 5;

  useEffect(() => {
    const loadPage = () => {
      const loadingScreen = document.querySelector<HTMLDivElement>('.loading_screen');
      if(!loadingScreen) return;

      loadingScreen.style.animation = "load_page 2s linear 0s";
      setTimeout(() => {
        loadingScreen.style.display = "none";
        loadingScreen.style.opacity = "0";
      }, 2000);      
    }

    loadPage();

    const watchMouseMovement = (event: MouseEvent) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
      });
    };
    window.addEventListener('mousemove', watchMouseMovement);
 
    return () => {
      window.removeEventListener(
        'mousemove',
        watchMouseMovement,
      );
    };
  }, []);

  useEffect(() => {
    if(!mouseDown) return;

    const onMouseUp = () => {
      setMouseDown(false);
      document.body.style.cursor = "default";
    };

    const onMouseMove = (event: MouseEvent) => {
      const crankBase = document.querySelector('.crank__base');
      const crank = document.querySelector<HTMLDivElement>('#crank');
      const curtains = document.querySelectorAll<HTMLDivElement>('.layer__curtain');
      const progressBar = document.querySelector<HTMLDivElement>('.progress_bar');
      if(!crank || !crankBase || !curtains || !progressBar) return;

      // calculate rotation angle
      const cb_midX = crankBase.getBoundingClientRect().x + crankBase.getBoundingClientRect().width / 2;
      const cb_midY = crankBase.getBoundingClientRect().y + crankBase.getBoundingClientRect().height / 2;

      const target = Math.atan2(event.clientY - cb_midY, event.clientX - cb_midX);
      let diff = target - oldAngle;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      const angle = oldAngle + diff*0.2;
      setOldAngle(angle);

      crank.style.transform = `rotate(${angle}rad)`;

      // count every complete rotation (6.283185rad = 360deg)
      if(Math.floor(angle/6.283185) >= count){
        setCount(Math.floor(angle/6.283185));
        setPercentage(Math.floor((angle*100)/(6.283185*MAX_ROTATION)));
        setProgress(Math.floor((totalPercentage+percentage)/(100*MAX_ROTATION)*100));
        progressBar.style.width = progress + "%";
        if(layer < curtains.length) {
          curtains[curtains.length-1-layer].style.animation = "light_flickering 1s linear 2s";
          curtains[curtains.length-1-layer].style.opacity = `${1 - percentage/100}`;
        }
        else startReload();

        if(percentage >= 100){
          setTotalPercentage(totalPercentage+percentage);
          setPercentage(0);
          setCount(0);
          setOldAngle(0);
          setLayer(layer+1);
        }           
      } 
    }

    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener("mousemove", onMouseMove);
    };    
  }, [mouseDown, count, mousePosition]);

  function startGrabbingLightSwitch() {
    const creaturesEyes = document.querySelector<HTMLDivElement>('#creatures_eyes');
    const creaturesArm = document.querySelector<HTMLDivElement>('.creature__operator');
    const lightSwitch = document.querySelector<HTMLDivElement>('.light_switch');

    if(!creaturesArm || !lightSwitch || !creaturesEyes) return;

    creaturesEyes.style.animation = "watch 3s linear 2s forwards";
    creaturesArm.style.animation = "grabbing_light_switch 4s linear 4s forwards";      
    lightSwitch.style.animation = "light_switch_drop 2s linear 2s both, light_switch_move 2s linear 6s";      
  }

  function startTurningLightOff() {
    const curtains = document.querySelectorAll<HTMLDivElement>('.layer__curtain');
    const loadingScreen = document.querySelector<HTMLDivElement>('.loading_screen');
    if(!curtains || !loadingScreen) return;

    curtains.forEach((curtain, index) => {
      curtain.style.animation = `light_switch_off 1s step-end calc(${index} * 1s + 1s) forwards`; 
    });

    setTimeout(() => {
      loadingScreen.style.display = "block";
      loadingScreen.style.animation = `light_switch_off 1s step-end 2s forwards`; 
    }, 2000);
  }

  function startReload() {
    startGrabbingLightSwitch();    
    setTimeout(() => startTurningLightOff(), 6000);
    setTimeout(() => window.location.reload(), 12000);
  }

  function handleGrabbingCrank() {
    if(!mouseDown) {
      setMouseDown(true);
      document.body.style.cursor = "grabbing";
    }
  }

  return (
    <>
      <section className="main">
        <div className='loading_screen'></div>
        <div className='progress_bar'></div>
        <h1>Light Switch</h1>
        <div className="container container__light">
          <div className='layer layer__content' id='cave_wall'>
            <div className='creature__operator'>
              <div className='creature__hand'>
                <img src='/assets/creature_hand.svg'></img>
              </div>
              <div className='creature__arm'>
                <img src='/assets/creature_arm.svg'></img>
              </div>
            </div>
            <div className='creature'>
              <img src='/assets/creatures_eyes.svg' id='creatures_eyes'></img>    
              <img src='/assets/creature.svg'></img>            
            </div>
            <div className='light_switch'></div>
          </div>
          <div className='layer layer__content'>
            <div className='image_container'>
              <img src='/assets/layer4.svg'></img>
            </div>  
          </div>
          <div className='layer layer__curtain'></div>
          <div className='layer layer__content'>
            <div className='image_container'>
              <img src='/assets/layer3.svg'></img>
            </div>  
          </div>
          <div className='layer layer__curtain'></div>
          <div className='layer layer__content'>
            <div className='image_container'>
              <img src='/assets/layer2.svg'></img>
            </div>  
          </div>
          <div className='layer layer__curtain'></div>
          <div className='layer layer__content'>
            <div className='image_container'>
              <img src='/assets/layer1.svg'></img>
            </div>            
          </div>
          <div className='layer layer__curtain'></div>
          <div className='layer layer__curtain'></div>
        </div>
        <div className="container container__switch">
          <div className='crank' id="crank">
            <div className='crank__base'></div>
            <div className='crank__handle'></div>
            <div className='crank__skrew'></div>
            <button className='crank__knob' onMouseDown={handleGrabbingCrank}></button>
          </div>
        </div>
      </section>      
    </>
  )
}

export default App
