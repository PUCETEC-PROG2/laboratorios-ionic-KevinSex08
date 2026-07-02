import { IonIcon, IonItem, IonLabel, IonThumbnail, IonButton, IonButtons } from '@ionic/react';
import './RepoItem.css'
import React from 'react'
import { pencil, trash } from 'ionicons/icons';
import { Repository } from '../interfaces/Repository';


interface RepoItemProps extends Repository {
    onDelete: (owner: string, name: string) => void;
    onEdit: (repo: Repository) => void;
}

const RepoItem: React.FC<RepoItemProps> = (props) => {
    const { id, name, description, language, owner, onDelete, onEdit } = props;
    
    // Reconstruct repository object for editing callback
    const repositoryObj: Repository = { id, name, description, language, owner };

    return(
      <IonItem className="repo-card-item" lines="none">
        <IonThumbnail slot="start">
          <img src={owner.avatar_url} alt={name}/>
        </IonThumbnail>
        <IonLabel>
          <h3>{name}</h3>
          <p>{description || "Sin descripción proporcionada."}</p>
          {language != null && language !== "" && (
            <div>
              <span className="lang-badge">{language}</span>
            </div>
          )}
        </IonLabel>
        <IonButtons slot="end" className="repo-action-buttons">
          <IonButton onClick={() => onEdit(repositoryObj)} className="edit-btn">
            <IonIcon icon={pencil} slot="icon-only" />
          </IonButton>
          <IonButton onClick={() => onDelete(owner.login, name)} className="delete-btn">
            <IonIcon icon={trash} slot="icon-only" />
          </IonButton>
        </IonButtons>
      </IonItem>
    )
}

export default RepoItem
