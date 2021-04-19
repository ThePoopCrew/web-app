import React, {useState, useEffect} from 'react';
import Nav from '../components/Nav';
import  { Tabs, Tab, Paper, Avatar, Box, Button, Dialog, DialogContent, DialogTitle, CircularProgress }  from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import LikesList from '../components/LikesList';
import TracksList from '../components/TracksList';
import UserPosseList from '../components/UserPosseList';
import ListChips from '../components/ListChips';
import getProfile from '../utils/getProfile';
import getLikes from '../utils/getLikes';
import getUsersLikes from '../utils/getUsersLikes';
import getPosts from '../utils/getUserPosts';
import getOtherUsersPosts from '../utils/getOtherUsersPosts';
import getUserProfile from '../utils/getUserProfile';
import EditForm from '../components/editProfile/EditForm';
import UserPosses from '../components/UserPosses';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import firebase from '../utils/Firebase';

const useStyles = makeStyles((theme) => ({
  large: {
    width: theme.spacing(15),
    height: theme.spacing(15),
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

function TabPanel(data) {
  const {children, value, index} = data;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
    >
      {value === index && (
        <Box p={3}>
          <h4>{children}</h4>
        </Box>
      )}
      
      
    </div>
  );
}

function Profile({username}) {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [userInfo, setUserInfo] = useState({});
  const [open, setOpen] = useState(false);
  const [popupOpen, setPopOpen] = useState({open: false, message:''});
  const [likes, setLikes] = useState(false);
  const [posts, setPosts] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    getUserData();
  };

  const handlePopupClose = () => {
    setPopOpen(false);
    getUserData();
  };

  const handleChange = (e, newVal) => {
    setPage(newVal);
  };

  const getUserData = async () => {
    if (username === undefined) {
      getUserProfile()
        .then(res => {
          setUserInfo(res.data);
          setLoading(false);
        })
        .catch(console.error);
    }
    else {
      getProfile(username)
        .then(res => {
          setUserInfo(res.data);
          setLoading(false);
        }).catch(console.error);
    }
    if (username === undefined) {
      getLikes()
        .then(res => {
          setLikes(res.data.results);
        })
        .catch(console.error);
    }
    else {
      getUsersLikes(username)
        .then(res => {
          setLikes(res.data.results);
        }).catch(console.error);
    }

    if (username === undefined) {
      getPosts()
        .then(res => {
          setPosts(res.data.results);
        })
        .catch(console.error);
    }
    else {
      getOtherUsersPosts(username)
        .then(res => {
          setPosts(res.data.results);
        })
        .catch(console.error);
    }

  };

  const Alert = (props) =>  {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  };

  const onAuthStateChanged = (user) => {
    // Check if the user has verified their email.
    if (user) 
      getUserData();
  };

  useEffect(() => {
    firebase.auth().onAuthStateChanged(onAuthStateChanged);
    console.log(username);
    getUserData();
    console.log(userInfo);
  }, []);

  return (
    <div>
      <Snackbar open={popupOpen.open} autoHideDuration={1500} onClose={handlePopupClose}>
        <Alert onClose={handlePopupClose} severity={'success'}>
          {popupOpen.message}
        </Alert>
      </Snackbar>
      <Nav />
      <div style={{display: 'flex', flexDirection: 'column', margin: '12vh', alignItems: 'center'}}>
        {loading ? <CircularProgress  /> : 
          (<div>
            <div style={{alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
              <Avatar className={classes.large} src={userInfo.picURL} />
              <h2>{(userInfo.firstName + ' ' + userInfo.lastName)}</h2>
              <h3 style={{maxWidth: 600}} >
                {(userInfo.bio === undefined) ? 'Add User Bio': userInfo.bio}
              </h3>
            </div>
            <div style={{justifyContent: 'center', display: 'flex'}}>
              {(username === undefined) ? (
                <div>
                  <Button variant='outlined' onClick={handleClickOpen} >
                    Edit Profile
                  </Button>
                </div>
              ) : (
                <div></div>
              )}
            </div>
            <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginLeft: '12vh', marginRight: '12vh', maxWidth: 600}}>
              <ListChips size={'medium'} chips={userInfo.tagLikes} />
            </div>
            <div>
              <Paper style={{display: 'flex', flexDirection: 'column', marginLeft: '12vh', marginRight: '12vh', width: '150vh'}} >
                <Tabs
                  indicatorColor='primary'
                  textColor='primary'
                  centered
                  value={page}
                  onChange={handleChange}
                >
                  <Tab centered label='Posse' />
                  <Tab centered label='Likes' />
                  <Tab centered label='Tracks' />

                </Tabs>
                <TabPanel value={page} index={0}>
                  {(username === undefined) ?
                    <UserPosses setPopup={setPopOpen}/>
                    :
                    <UserPosseList posses={userInfo.posses}/>
                  }
                </TabPanel>
                <TabPanel value={page} index={1}>
                  <LikesList likes={likes}/>
                </TabPanel>
                <TabPanel value={page} index={2}>
                  <TracksList posts={posts}/>
                </TabPanel>
              </Paper>
            </div>
          </div>)}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth='md'
          fullWidth={true}
        >
          <DialogTitle id="alert-dialog-title">Edit Profile</DialogTitle>
          <DialogContent>
            <EditForm userData={userInfo} closeDialog={handleClose} />
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}


export default Profile;