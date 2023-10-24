import React, { useState ,useCallback, useEffect} from 'react'
import { useSocket } from '../context/SocketProvider'
import { useNavigate } from 'react-router-dom'


const Lobby = () => {
    const [email, setEmail] = useState("")
    const [roomno, setRoomno] = useState("")
    const socket = useSocket()
    const navigate =useNavigate();

    const handleSubmit = useCallback((e)=>{
        e.preventDefault()
        socket.emit("joinRoom", {email, roomno})

    },[email,roomno])

    const handleJoinRoom = useCallback(
      (data) => {
        const {email,roomno} =data
       navigate(`/room/${roomno}`)
      },
      [],
    )
    

    useEffect(() => {
      socket.on("joinRoom" ,handleJoinRoom)
        
      return () => {
        socket.off("joinRoom",handleJoinRoom)
      }
    }, [socket,handleJoinRoom])
    

    return (
        <div>
            <h1>Lobby</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor='email'> Email Id</label>
                <input type='email' id='email' value={email}
                    onChange={(e) => setEmail(e.target.value)} />
                <label htmlFor='roomno'> Room Number</label>
                <input type='text' id='roomno' value={roomno}
                    onChange={(e) => setRoomno(e.target.value)} />
                <button type='submit'>Join</button>
            </form>
        </div>
    )
}

export default Lobby