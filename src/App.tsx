import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { CheckListMasterView } from './components/checklist-master';
import { CheckListCollection } from './model/checklist';
import { Flex } from '@fluentui/react-northstar';
import { CheckListDetail } from './components/checklistDetail';
import { useMediaQuery } from 'react-responsive';
import { useHistory, useParams } from 'react-router';
import firebase from 'firebase';
import { StyledFirebaseAuth } from 'react-firebaseui';

const uiConfig = {
  signInFlow: 'popup',
  signInSuccessUrl: "/",
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    ],
}

function App() {
  const isDesktopOrLaptop = useMediaQuery({ minWidth: 700 })
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [user, setUser] = useState<firebase.User|null>(null);
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(user => {
      setUser(user);
    });
    return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  const collection = useMemo(() => {
    if (user) {
      return new CheckListCollection(user.uid);
    }
    else {
      return undefined;
    }
    
  }, [user])
  useEffect(() => {
    if (collection) {
      collection.load();
    }
    
  }, [collection])

  if (!collection || !user) {
    return (
      <div>
        <p>Please sign-in:</p>
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
      </div>
    );
  }



  const item = collection.CheckLists.find(checkList => checkList.Id === id);
  if (id && !item) {
    history.push('/')
  }


  if (isDesktopOrLaptop) {
    return (
      <div>
        <Flex style={{ width: '100vw' }}>
          <Flex.Item size="20rem">
            <div>
              <CheckListMasterView collection={collection} selected={id}  userName={user.displayName ||""} ></CheckListMasterView>
            </div>
          </Flex.Item>
          <Flex.Item grow>
            <div>
              <CheckListDetail checkList={item}></CheckListDetail>
            </div>
          </Flex.Item>
        </Flex>
      </div>
    );
  } else {
    if (item) {
      return (
        <div>
          <CheckListDetail checkList={item}></CheckListDetail>
        </div>
      );
    } else {
      return (
        <div>
          <CheckListMasterView collection={collection} selected={id} userName={user.displayName || ""} ></CheckListMasterView>
        </div>
      );

    }
  }
}

export default App;
