import axios from 'axios';
import ApiConfig from './ApiConfig';
import firebase from './Firebase';

async function unlikePost(postID) {
  return firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(token => {
    const config = {
      headers: {Authorization: `Bearer ${token}`}
    };

    const postQuery = ApiConfig.unlikePost + '/' + postID;

    return axios.post(postQuery, {}, config)
      .catch(error => console.error('Error: ', error));
  }).catch(console.error);
}

export default unlikePost;