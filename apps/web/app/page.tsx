'use client'
import { useSocket } from '../context/SocketProvider'
import classes from './page.module.css';
import { useState } from 'react';

export default function Page(){
  const {sendMessage} = useSocket();
  const [message, setMessage] = useState('');
  return (
    <div>
      <div>
        All messages will appear here
      </div>
      <div>
        <input onChange={e=> setMessage(e.target.value)} className={classes["chat-input"]} type="text" placeholder="Message..."/>
        <button onClick={e=> sendMessage(message)} className={classes["button"]}>Send</button>
      </div>
    </div>
  )
}