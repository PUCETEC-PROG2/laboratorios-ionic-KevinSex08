import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonTextarea, IonButton, useIonViewWillEnter, useIonToast, useIonLoading } from '@ionic/react';
import './Tab2.css';
import { useState } from 'react';
import { RepositoryPayload } from '../interfaces/RepositoryPayload';
import React from 'react';
import { createRepository } from '../services/GithubService';
import { useHistory } from 'react-router';

const Tab2: React.FC = () => {
  const history = useHistory();
  const [presentToast] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();
  
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
      message: 'Creando repositorio en GitHub...',
      spinner: 'circular'
    });
    
    try {
      await createRepository(repositoryData);
      
      // Dismiss loading and present success toast
      await dismissLoading();
      presentToast({
        message: `¡Repositorio "${nameVal}" creado con éxito!`,
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });

      // Reset form and navigate
      setRepositoryData({
        name: "",
        description: ""
      });
      history.push("/tab1");
    } catch (error: any) {
      await dismissLoading();
      
      presentToast({
        message: `Error al crear el repositorio: ${error.message || error}`,
        duration: 3500,
        color: 'danger',
        position: 'bottom'
      });
    }
  };
  
  useIonViewWillEnter(() => {
    setValidationErrors({});
  })

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Crear Repositorio</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Crear Repositorio</IonTitle>
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
            Guardar Repositorio
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
