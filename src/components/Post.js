import React, { useState, useEffect } from 'react';
import { Avatar, Box, IconButton, Tooltip } from '@material-ui/core';
import ListChips from './ListChips';
import getComments from '../utils/getComments';
import Comments from './Comments';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AddCommentIcon from '@material-ui/icons/AddComment';
import likePost from '../utils/likePost';
import unlikePost from '../utils/unlikePost';
import LikeButton from './LikeButton';
import CommentModel from './CommentModel';
import getUserProfile from '../utils/getUserProfile';
import AudioButtons from './AudioButtons';
import getFile from '../utils/getFile';

function Posts({post}) {
  const [comments, setComments] = useState([]);
  const [expandComments, setExpand] = useState(false);
  const [likes, setLikes] = useState((post.likes === undefined) ? 0 : post.likes.length);
  const [openModel, setModelOpen] = useState(false);
  const [show, setShow] = useState('Show');
  const [beatURL, setBeatURL] = useState(null);
  const [recordingURL, setRecordingURL] = useState(null);
  const id = post.postID;

  useEffect(async () => {
    getPostComments();

    if (post.hasAudio) {
      console.log('has Audio');
      await getFile(post.beatFile)
        .then(res => setBeatURL(res))
        .catch(console.error);
      await getFile(post.recordingFile)
        .then(res => setRecordingURL(res))
        .catch(console.error);
    }
  }, []);

  const getPostComments = async () => {

    getUserProfile()
      .then(user => {
        getComments(id)
          .then(res => {
            // we make sure our post has at least one comment
            let data = [];
            if (res.data.results.length !== 0 && res.data) {
              res.data.results.forEach((comment, index) => {
                res.data.results[index].alreadyLiked = comment.likes ? (comment.likes.includes(user.data.username)) : false;
                data.push(res.data.results[index]);
              });
              setComments(data);
            }
          })
          .catch(console.error);
      })
      .catch(console.error);
    
  };


  const handleCommentModelOpen = () => {
    setModelOpen(true);
  };

  const handleCommentModelClose = () => {
    setModelOpen(false);
    getPostComments();
  };


  const handleCommentToggle = () => {
    const val = (expandComments) ? 'Show' : 'Hide';
    setShow(val);
    setExpand(!expandComments);
  };
  
  const likePostCall = async (id) => {
    console.log('postid: ', id);
    console.log('liking post');
    setLikes(likes + 1);
    likePost(id)
      .then(() => console.log('liking post: ', post.content, ' post id is: ', id))
      .catch(error => {console.log(error); setLikes(likes - 1);});
  };

  const unlikePostCall = async (id) => {
    console.log('unliking post');
    setLikes(likes - 1);
    unlikePost(id)
      .then(() => console.log('unliking post: ', post.content, ' post id is: ', id))
      .catch(error => {console.log(error); setLikes(likes + 1);});
  };



  return (
    <div>
      <Box  borderBottom={2}>
        <div style={{margin: '1vh'}}>
          <div style={{display: 'flex'}}>
            <Box  style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <Avatar style={{height: '5vh', margin: '.5vh', width: '5vh'}} src={post.image}></Avatar>
              <h3>{post.username}</h3>
              <ListChips variant={'outlined'} size={'small'} chips={post.posses} />
            </Box>
          </div>
          <div style={{display: 'flex' , flexDirection: 'column'}}>
            <h2 style={{alignSelf: 'center', fontWeight: 'normal'}}>{post.content}</h2>
            <Box style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
              <LikeButton id={post.postID} likes={likes} onLike={likePostCall} onUnLike={unlikePostCall} alreadyLiked={post.alreadyLiked} />
              <Tooltip title='Comment'>
                <IconButton onClick={() => handleCommentModelOpen()}>
                  <AddCommentIcon></AddCommentIcon>
                </IconButton>
              </Tooltip>
              <AudioButtons userAudio={recordingURL} userBeat={beatURL} />
            </Box>
            <div onClick={() => handleCommentToggle()}>
              {(expandComments) ? <ExpandLessIcon /> : <ExpandMoreIcon /> } {show} Comments
            </div>
            <Comments comments={comments} expand={expandComments} update={getPostComments} />
            <CommentModel open={openModel} close={handleCommentModelClose} postId={id} />
          </div>
        </div>
      </Box>
    </div>
  );
}

export default Posts;