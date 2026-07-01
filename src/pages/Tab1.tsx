import React from 'react';
import { IonContent, IonHeader, IonList, IonPage, IonText, IonTitle, IonToolbar, useIonViewWillEnter} from '@ionic/react';
import './Tab1.css';
import RepoItem from '../components/RepoItem';
import { Repository } from '../interfaces/Repository';
import { fetchRepositories } from '../services/GithubService';
import LoadingSpinner from '../components/LoadingSpinner';

const Tab1: React.FC = () => {
  const [repositoryList, setRepositoryList] = React.useState<Repository[]> ([]);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("")

  const loadRepos = async () => {
    setLoading(true);
    fetchRepositories()
      .then((reposData) => setRepositoryList(reposData))
      .catch((error) => setErrorMsg("Error  al cargar repositorio." + error))
      .finally(() => setLoading(false));

  };

  useIonViewWillEnter(() => {
    loadRepos();
  });
  
  return (

    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Repositorios</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="Ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Repositorios</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonList>

        {repositoryList.map((repo) => (
          <RepoItem {...repo} />
        ))}
 

        </IonList>
        {loading && <LoadingSpinner />}
        {errorMsg != "" &&
        (<IonText color="danger">
          <p>{errorMsg}</p>
        </IonText>)
        }

      </IonContent>
    </IonPage>
  );
};

export default Tab1;
