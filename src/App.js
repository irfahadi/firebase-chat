import React, { Component } from "react";
import { GiftedChat } from "react-web-gifted-chat";
import firebase from "firebase";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";

const admin = require("firebase-admin");
const serviceAccount = require("./ServiceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const uid = "SYZ83fHmRcTTSSBjQYDaXs07jg83";

const config = {
  apiKey: "AIzaSyDFNCYcXTkcH1x8x_nijmK2Ln70GtXyOjk",
  authDomain: "chat-ea236.firebaseapp.com",
  databaseURL: "https://chat-ea236-default-rtdb.firebaseio.com",
  projectId: "chat-ea236",
  storageBucket: "chat-ea236.appspot.com",
  messagingSenderId: "103813362336",
  appId: "1:103813362336:web:bac9eb3f3223f6db250fc5",
};
if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      user: {},
      isAuthenticated: false,
    };
  }

  async signIn() {
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    try {
      await firebase.auth().signInWithPopup(googleProvider);
    } catch (error) {
      console.error(error);
    }
  }

  signOut() {
    firebase.auth().signOut();
  }

  componentDidMount() {
    admin
      .auth()
      .createCustomToken(uid)
      .then((costumToken) => {
        firebase
          .auth()
          .signInWithCustomToken(costumToken)
          .then((userCredential) => {
            // Signed in

            var user = userCredential.user;
            this.setState({ isAuthenticated: true, user });
            this.loadMessages();
            // ...
          })
          .catch((error) => {
            // var errorCode = error.code;
            // var errorMessage = error.message;
            this.setState({ isAuthenticated: false, user: {}, messages: [] });
            console.log(error);
            // ...
          });
      })
      .catch((error) => console.log(error));
  }

  loadMessages() {
    const callback = (snap) => {
      const message = snap.val();
      message.id = snap.key;
      const { messages } = this.state;
      messages.push(message);
      this.setState({ messages });
    };
    firebase
      .database()
      .ref("/messages/")
      .limitToLast(12)
      .on("child_added", callback);
  }

  renderPopup() {
    return (
      <Dialog open={!this.state.isAuthenticated}>
        <DialogTitle id="simple-dialog-title">Sign in</DialogTitle>
        <div>
          <List>
            <ListItem button onClick={() => this.signIn()}>
              <ListItemAvatar>
                <Avatar style={{ backgroundColor: "#eee" }}>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                    height="30"
                    alt="G"
                  />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Sign in with Google" />
            </ListItem>
          </List>
        </div>
      </Dialog>
    );
  }

  onSend(messages) {
    for (const message of messages) {
      this.saveMessage(message);
    }
  }

  async saveMessage(message) {
    return firebase
      .database()
      .ref("/messages/")
      .push({
        id: message.id,
        text: message.text,
        user: {
          avatar: this.state.user.photoURL,
          id: this.state.user.uid,
          name: this.state.user.displayName,
        },
      })
      .catch(function (error) {
        console.error("Error saving message to Database:", error);
      });
  }

  renderSignOutButton() {
    if (this.state.isAuthenticated) {
      return <Button onClick={() => this.signOut()}>Sign out</Button>;
    }
    return null;
  }

  renderChat() {
    return (
      <GiftedChat
        user={this.chatUser}
        messages={this.state.messages.slice().reverse()}
        onSend={(messages) => this.onSend(messages)}
      />
    );
  }

  renderChannels() {
    return (
      <List>
        <ListItem button>
          <ListItemAvatar>
            <Avatar>D</Avatar>
          </ListItemAvatar>
          <ListItemText primary="Default" />
        </ListItem>
      </List>
    );
  }

  renderChannelsHeader() {
    return (
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="h6" color="inherit">
            Channels
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
  renderChatHeader() {
    return (
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="h6" color="inherit">
            Default channel
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
  renderSettingsHeader() {
    return (
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="h6" color="inherit">
            Settings
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }

  render() {
    return (
      <div style={styles.container}>
        {/* {console.log(this.state.user.photoURL)} */}
        {/* {this.renderPopup()} */}
        <div style={styles.channelList}>
          {this.renderChannelsHeader()}
          {this.renderChannels()}
        </div>
        <div style={styles.chat}>
          {this.renderChatHeader()}
          {this.renderChat()}
        </div>
        <div style={styles.settings}>
          {this.renderSettingsHeader()}
          {this.renderSignOutButton()}
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    height: "100vh",
  },
  channelList: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  chat: {
    display: "flex",
    flex: 3,
    flexDirection: "column",
    borderWidth: "1px",
    borderColor: "#ccc",
    borderRightStyle: "solid",
    borderLeftStyle: "solid",
  },
  settings: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
};

export default App;
