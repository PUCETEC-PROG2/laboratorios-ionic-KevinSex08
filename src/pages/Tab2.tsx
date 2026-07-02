import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonTextarea, IonButton, useIonToast, useIonLoading } from '@ionic/react';
import './Tab2.css';
import { useState } from 'react';
import { RepositoryPayload } from '../interfaces/RepositoryPayload';
import React from 'react';
import { createRepository, updateRepository } from '../services/GithubService';
import { useHistory, useLocation } from 'react-router-dom';
import { Repository } from '../interfaces/Repository';

const Tab2: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ mode?: string; repo?: Repository }>();
  const [presentToast] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRepo, setEditingRepo] = useState<Repository | null>(null);

  const [repositoryData, setRepositoryData] = useState<RepositoryPayload>({
    name: "",
    description: ""
  });
  const [validationErrors, setValidationErrors] = useState<{ name?: string }>({});

  const saveRepo = async() => {
    let nameError = "";
    const nameVal = repositoryData.name.trim();

    if (nameVal === "") {
      nameError = "El nombre del repositorio es obligatorio.";
    } else if (/\s/.test(repositoryData.name)) {
      nameError = "El nombre no puede contener espacios (usa '-' o '_').";
    } else if (nameVal.length < 3) {
      nameError = "El nombre debe tener al menos 3 caracteres.";
    }

    if (nameError) {
      setValidationErrors({ name: nameError });
      return;
    }

    setValidationErrors({});
    
    // Present native loading backdrop
    await presentLoading({
      message: isEditMode ? 'Actualizando repositorio en GitHub...' : 'Creando repositorio en GitHub...',
      spinner: 'circular'
    });
    
    try {
      if (isEditMode && editingRepo) {
        await updateRepository(editingRepo.owner.login, editingRepo.name, {
          name: nameVal,
          description: repositoryData.description
        });
        
        await dismissLoading();
        presentToast({
          message: `¡Repositorio "${nameVal}" actualizado con éxito!`,
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
      } else {
        await createRepository(repositoryData);
        
        // Dismiss loading and present success toast
        await dismissLoading();
        presentToast({
          message: `¡Repositorio "${nameVal}" creado con éxito!`,
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
      }

      // Reset form and navigate
      setRepositoryData({
        name: "",
        description: ""
      });
      setIsEditMode(false);
      setEditingRepo(null);
      history.push("/tab1");
    } catch (error: any) {
      await dismissLoading();
      
      presentToast({
        message: `Error al ${isEditMode ? 'actualizar' : 'crear'} el repositorio: ${error.message || error}`,
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
  };
  
  React.useEffect(() => {
    setValidationErrors({});
    const state = location.state;
    if (state && state.mode === 'edit' && state.repo) {
      setRepositoryData({
        name: state.repo.name,
        description: state.repo.description || ""
      });
      setEditingRepo(state.repo);
      setIsEditMode(true);
    } else {
      setRepositoryData({
        name: "",
        description: ""
      });
      setEditingRepo(null);
      setIsEditMode(false);
    }
  }, [location.state, location.pathname]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isEditMode ? 'Renombrar Repositorio' : 'Crear Repositorio'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{isEditMode ? 'Renombrar Repositorio' : 'Crear Repositorio'}</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="form-container">
          <IonInput 
            className={`form-field ${validationErrors.name ? 'ion-invalid ion-touched' : ''}`}
            label="Nombre del repositorio *"
            labelPlacement="floating"
            placeholder="Ejemplo: mi-proyecto-ionic"
            value={repositoryData.name}
            onIonInput={(e) => {
              const val = e.detail.value || "";
              setRepositoryData({...repositoryData, name: val});
              
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
            value={repositoryData.description}
            onIonChange={(e) => setRepositoryData({...repositoryData, description: e.detail.value!})}
            rows={4}
          />
          <IonButton
            className="form-field gradient-btn"
            expand="block"
            shape="round"
            onClick={saveRepo}
            disabled={!!validationErrors.name || repositoryData.name.trim() === ""}
          >
            {isEditMode ? 'Renombrar Repositorio' : 'Guardar Repositorio'}
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
