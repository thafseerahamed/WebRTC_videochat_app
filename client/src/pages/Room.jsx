import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider'
import ReactPlayer from "react-player"
import peer from '../service/peer';

const Room = () => {


    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null)
    const [myStream, setMyStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)
    const handleUserJoined = useCallback(
        ({ email, id }) => {
            setRemoteSocketId(id)
            console.log(`${email} user joined`);
        },
        [],
    )

    const handleIncomingCall = useCallback(
        async ({ from, offer }) => {
            setRemoteSocketId(from);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true, video: true
            })
            setMyStream(stream)
            console.log("Incoming call", from, offer);
            const ans = await peer.getAnswer(offer);
            socket.emit('callAccepted', {
                to: from, ans
            })
        }, [socket]);

        const sendStreams=useCallback(()=>{
            for (const track of myStream.getTracks()) {
                peer.peer.addTrack(track, myStream);
            }
        },[myStream])

    const handleCallAccepted = useCallback(
        async ({ from, ans }) => {
            console.log("Call accepted", from, ans);
            peer.setLocalDescription(ans);
           sendStreams()
        }, [sendStreams]);

    const handleCallUser = useCallback(
        async () => {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true, video: true
            })
            const offer = await peer.getOffer()
            socket.emit('userCall', { to: remoteSocketId, offer })
            setMyStream(stream)
        },
        [remoteSocketId, socket],
    )
    const handleNegotNeeded = useCallback(async () => {
        const offer = await peer.getOffer()
        socket.emit('peerNegNeed', {
            to: remoteSocketId, offer
        })
    }, [remoteSocketId, socket])

    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegotNeeded)
        return () => {
            peer.peer.removeEventListener("negotiationneeded", handleNegotNeeded)
        }
    }, [handleNegotNeeded])

    useEffect(() => {
        peer.peer.addEventListener("track", async (ev) => {
            const remoteStream = ev.streams;
            console.log("------------GOT TRACKS--------------");
            setRemoteStream(remoteStream[0])
        })
    }, [])

    const handleNegNeedIncoming = useCallback(async ({from, offer}) => {
        const ans = await peer.getAnswer(offer)
        socket.emit('negoDone', {
            to: from, ans
        })

    }, [socket])

    const handleNegFinal = useCallback(async ({from, ans}) => {
        await peer.setLocalDescription(ans)

    }, [])
    useEffect(() => {
        socket.on("userJoined", handleUserJoined)
        socket.on("incomingCall", handleIncomingCall)
        socket.on("callAccepted", handleCallAccepted)
        socket.on("peerNegNeed", handleNegNeedIncoming)
        socket.on("negFinal", handleNegFinal)
        return () => {
            socket.off("userJoined", handleUserJoined);
            socket.off("incomingCall", handleIncomingCall);
            socket.off("callAccepted", handleCallAccepted);
            socket.off("peerNegNeed", handleNegNeedIncoming);
            socket.off("negFinal", handleNegFinal);
        }
    }, [socket, handleUserJoined, handleIncomingCall,
        handleCallAccepted, handleNegNeedIncoming, handleNegFinal])


    return (
        <div>
            <h2>Room</h2>
            <h5>{remoteSocketId ? "Connected" : "No one in the Room"}</h5>
            {remoteSocketId && <button onClick={handleCallUser}> CALL</button>}
            {myStream && <button onClick={sendStreams}>Send Stream</button>}
            {myStream && <><h2>My Stream</h2><ReactPlayer height={100} width={200} playing muted url={myStream} /></>}
            {remoteStream && <><h2>Remote Stream</h2><ReactPlayer height={100} width={200} playing muted url={remoteStream} /></>}
        </div>

    )
}

export default Room