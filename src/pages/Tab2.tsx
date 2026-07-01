import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar,IonInput, IonTextarea, IonButton, IonText, useIonViewWillEnter } from '@ionic/react';
import './Tab2.css';
import { useState } from 'react';
import { RepositoryPayload } from '../interfaces/RepositoryPayload';
import React from 'react';
import { createRepository } from '../services/GithubService';
import { useHistory } from 'react-router';
import LoadingSpinner from '../components/LoadingSpinner';

const Tab2: React.FC = () => {
  const history = useHistory();
  const [repositoryData, setRepositoryData] = useState<RepositoryPayload>({
    name: "",
    description: ""
  });
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const saveRepo = async() => {
    if(repositoryData.name.trim() == ''){
      setErrorMsg("El nombre del repositorio es obligatio");
      return;
    }
    setLoading(true);
    createRepository(repositoryData)
      .then(() => history.push("/tab1"))
      .catch((error) => setErrorMsg("Error  al cargar repositorio." + error))
      .finally(() => {
        setLoading(false);
        setRepositoryData({
          name: "",
          description: ""
        });
      })
  };
  
  useIonViewWillEnter(() => {
    setErrorMsg("");
  })

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Formulario de repo</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Formulario de repo</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="form-container">
          <IonInput 
            className = "form-field"
            label="Nombre del repositorio"
            labelPlacement="floating"
            placeholder="Ingrese el nombre del repositorio"
            value={repositoryData.name}
            onIonChange={(e) => setRepositoryData({...repositoryData, name: e.detail.value!})}
          />
          <IonTextarea
            className = "form-field"
            label="Descripcion del repositorio"
            labelPlacement="floating"
            placeholder="Ingrese el descripcion del repositorio"
            value={repositoryData.description}
            onIonChange={(e) => setRepositoryData({...repositoryData, description: e.detail.value!})}
            rows={6}
          />
          {errorMsg != "" && <IonText color="danger">{errorMsg}</IonText>}
          <IonButton
            className = "form-field"
            expand="block"
            shape="round"
            color="primary"
            onClick={saveRepo}
          >
            Guardar
          </IonButton>
        </div>
        {loading && <LoadingSpinner />}
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
