import React from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonList, 
  IonPage, 
  IonText, 
  IonTitle, 
  IonToolbar, 
  useIonViewWillEnter, 
  IonRefresher, 
  IonRefresherContent, 
  RefresherEventDetail,
  useIonAlert,
  useIonToast,
  useIonLoading
} from '@ionic/react';
import './Tab1.css';
import RepoItem from '../components/RepoItem';
import { Repository } from '../interfaces/Repository';
import { fetchRepositories, deleteRepository } from '../services/GithubService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useHistory } from 'react-router-dom';

const Tab1: React.FC = () => {
  const history = useHistory();
  const [repositoryList, setRepositoryList] = React.useState<Repository[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  // Ionic Hooks for Overlays
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();

  const loadRepos = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const reposData = await fetchRepositories();
      setRepositoryList(reposData);
    } catch (error: any) {
      setErrorMsg("Error al cargar repositorios: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    try {
      const reposData = await fetchRepositories();
      setRepositoryList(reposData);
      setErrorMsg("");
    } catch (error: any) {
      setErrorMsg("Error al recargar: " + error.message);
    } finally {
      event.detail.complete();
    }
  };

  // 1. DELETE Flow
  const handleDelete = (owner: string, name: string) => {
    presentAlert({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar permanentemente el repositorio "${name}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await presentLoading({
              message: 'Eliminando repositorio de GitHub...',
              spinner: 'circular'
            });

            try {
              await deleteRepository(owner, name);
              await dismissLoading();
              presentToast({
                message: `El repositorio "${name}" ha sido eliminado.`,
                duration: 2000,
                color: 'success',
                position: 'bottom',
                buttons: [
                  {
                    text: 'Cerrar',
                    role: 'cancel'
                  }
                ]
              });
              // Reload list
              loadRepos();
            } catch (err: any) {
              await dismissLoading();
              presentToast({
                message: `Error al eliminar el repositorio: ${err.message}`,
                duration: 4000,
                color: 'danger',
                position: 'bottom',
                buttons: [
                  {
                    text: 'Cerrar',
                    role: 'cancel'
                  }
                ]
              });
            }
          }
        }
      ]
    });
  };

  // 2. EDIT Navigation
  const handleEditInit = (repo: Repository) => {
    history.push('/tab2', { mode: 'edit', repo });
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
      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Repositorios</IonTitle>
          </IonToolbar>
        </IonHeader>

        {/* Pull-to-refresh component */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingText="Desliza para actualizar..." refreshingText="Cargando repositorios..."></IonRefresherContent>
        </IonRefresher>

        <IonList>
          {repositoryList.map((repo) => (
            <RepoItem 
              key={repo.id} 
              {...repo} 
              onDelete={handleDelete}
              onEdit={handleEditInit}
            />
          ))}
        </IonList>

        {loading && <LoadingSpinner />}
        {errorMsg !== "" && (
          <IonText color="danger">
            <p>{errorMsg}</p>
          </IonText>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
