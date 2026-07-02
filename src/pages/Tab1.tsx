import React, { useState } from 'react';
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
  useIonLoading,
  IonModal,
  IonInput,
  IonTextarea,
  IonButton,
  IonButtons
} from '@ionic/react';
import './Tab1.css';
import RepoItem from '../components/RepoItem';
import { Repository } from '../interfaces/Repository';
import { fetchRepositories, deleteRepository, updateRepository } from '../services/GithubService';
import LoadingSpinner from '../components/LoadingSpinner';

const Tab1: React.FC = () => {
  const [repositoryList, setRepositoryList] = React.useState<Repository[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  // Ionic Hooks for Overlays
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [editData, setEditData] = useState({ name: "", description: "" });
  const [validationErrors, setValidationErrors] = useState<{ name?: string }>({});

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
                position: 'bottom'
              });
              // Reload list
              loadRepos();
            } catch (err: any) {
              await dismissLoading();
              presentToast({
                message: `Error al eliminar el repositorio: ${err.message}`,
                duration: 3500,
                color: 'danger',
                position: 'bottom'
              });
            }
          }
        }
      ]
    });
  };

  // 2. EDIT Modal Opening
  const handleEditInit = (repo: Repository) => {
    setSelectedRepo(repo);
    setEditData({
      name: repo.name,
      description: repo.description || ""
    });
    setValidationErrors({});
    setIsEditModalOpen(true);
  };

  // 3. EDIT Save Flow
  const handleSaveEdit = async () => {
    if (!selectedRepo) return;

    let nameError = "";
    const nameVal = editData.name.trim();

    if (nameVal === "") {
      nameError = "El nombre del repositorio es obligatorio.";
    } else if (/\s/.test(editData.name)) {
      nameError = "El nombre no puede contener espacios (usa '-' o '_').";
    } else if (nameVal.length < 3) {
      nameError = "El nombre debe tener al menos 3 caracteres.";
    }

    if (nameError) {
      setValidationErrors({ name: nameError });
      return;
    }

    setValidationErrors({});
    setIsEditModalOpen(false);

    await presentLoading({
      message: 'Actualizando repositorio en GitHub...',
      spinner: 'circular'
    });

    try {
      // API call to PATCH /repos/{owner}/{repo} where repo is the original name
      await updateRepository(selectedRepo.owner.login, selectedRepo.name, {
        name: nameVal,
        description: editData.description
      });

      await dismissLoading();
      presentToast({
        message: '¡Repositorio actualizado con éxito!',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      
      // Reload list
      loadRepos();
    } catch (err: any) {
      await dismissLoading();
      presentToast({
        message: `Error al actualizar el repositorio: ${err.message}`,
        duration: 3500,
        color: 'danger',
        position: 'bottom'
      });
    }
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

        {/* Edit Repository Modal */}
        <IonModal isOpen={isEditModalOpen} onDidDismiss={() => setIsEditModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Editar Repositorio</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsEditModalOpen(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <div className="modal-form-container">
              <IonInput 
                className={`form-field ${validationErrors.name ? 'ion-invalid ion-touched' : ''}`}
                label="Nombre del repositorio *"
                labelPlacement="floating"
                placeholder="Nombre del repositorio"
                value={editData.name}
                onIonInput={(e) => {
                  const val = e.detail.value || "";
                  setEditData({...editData, name: val});
                  
                  // Validación en tiempo real
                  let err = "";
                  if (val.trim() === "") {
                    err = "El nombre del repositorio es obligatorio.";
                  } else if (/\s/.test(val)) {
                    err = "El nombre no puede contener espacios (usa '-' o '_').";
                  } else if (val.trim().length < 3) {
                    err = "El nombre debe tener al menos 3 caracteres.";
                  }
                  setValidationErrors(prev => ({...prev, name: err}));
                }}
                errorText={validationErrors.name}
                required
              />
              <IonTextarea
                className="form-field"
                label="Descripción"
                labelPlacement="floating"
                placeholder="Ingrese la descripción del repositorio"
                value={editData.description}
                onIonChange={(e) => setEditData({...editData, description: e.detail.value!})}
                rows={4}
              />
              <IonButton
                className="form-field gradient-btn"
                expand="block"
                shape="round"
                onClick={handleSaveEdit}
                disabled={!!validationErrors.name || editData.name.trim() === ""}
              >
                Guardar Cambios
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

      </IonContent>
    </IonPage>
  );
};

export default Tab1;
