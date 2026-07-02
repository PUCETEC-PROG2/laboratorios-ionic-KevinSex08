import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Tab2 from './Tab2';
import { createRepository, updateRepository } from '../services/GithubService';

// Mock react-router-dom
const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockLocationState: any = undefined;

vi.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useLocation: () => ({
    state: mockLocationState,
    pathname: '/tab2',
  }),
}));

// Mock ionic react hooks
const mockPresentToast = vi.fn();
const mockPresentLoading = vi.fn();
const mockDismissLoading = vi.fn();

vi.mock('@ionic/react', async (importOriginal) => {
  const original = (await importOriginal()) as any;
  return {
    ...original,
    useIonToast: () => [mockPresentToast],
    useIonLoading: () => [mockPresentLoading, mockDismissLoading],
  };
});

// Mock GithubService
vi.mock('../services/GithubService', () => ({
  createRepository: vi.fn(),
  updateRepository: vi.fn(),
}));

describe('Tab2 - Crear y Editar Repositorio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationState = undefined;
  });

  it('renders in create mode by default', () => {
    const { container } = render(<Tab2 />);

    // Titles should say "Crear Repositorio"
    const titles = container.querySelectorAll('ion-title');
    expect(titles.length).toBeGreaterThan(0);
    expect(titles[0].textContent).toBe('Crear Repositorio');

    // Button should say "Guardar Repositorio"
    const button = container.querySelector('ion-button');
    expect(button).not.toBeNull();
    expect(button?.textContent).toBe('Guardar Repositorio');
  });

  it('renders in edit mode when router state has mode="edit"', () => {
    mockLocationState = {
      mode: 'edit',
      repo: {
        id: 123,
        name: 'mi-repo-existente',
        description: 'Una descripcion',
        language: 'TypeScript',
        owner: {
          login: 'octocat',
          avatar_url: 'https://github.com/images/error/octocat_happy.gif'
        }
      }
    };

    const { container } = render(<Tab2 />);

    // Titles should say "Renombrar Repositorio"
    const titles = container.querySelectorAll('ion-title');
    expect(titles.length).toBeGreaterThan(0);
    expect(titles[0].textContent).toBe('Renombrar Repositorio');

    // Input fields should be populated (custom elements have value attribute)
    const nameInput = container.querySelector('ion-input');
    expect(nameInput?.getAttribute('value')).toBe('mi-repo-existente');

    const descTextarea = container.querySelector('ion-textarea');
    expect(descTextarea?.getAttribute('value')).toBe('Una descripcion');

    // Button should say "Renombrar Repositorio"
    const button = container.querySelector('ion-button');
    expect(button?.textContent).toBe('Renombrar Repositorio');
  });

  it('performs create repository on save when in create mode', async () => {
    const { container } = render(<Tab2 />);

    const nameInput = container.querySelector('ion-input');
    const descTextarea = container.querySelector('ion-textarea');
    const saveButton = container.querySelector('ion-button');

    expect(nameInput).not.toBeNull();
    expect(descTextarea).not.toBeNull();
    expect(saveButton).not.toBeNull();

    // Enter values via custom events for Ionic custom web components
    fireEvent(nameInput!, new CustomEvent('ionInput', {
      detail: { value: 'nuevo-repo' }
    }));
    fireEvent(descTextarea!, new CustomEvent('ionChange', {
      detail: { value: 'Nueva descripcion' }
    }));

    // Click save
    fireEvent.click(saveButton!);

    await waitFor(() => {
      expect(createRepository).toHaveBeenCalledWith({
        name: 'nuevo-repo',
        description: 'Nueva descripcion'
      });
      expect(mockPush).toHaveBeenCalledWith('/tab1');
    });
  });

  it('performs update repository on save when in edit mode', async () => {
    mockLocationState = {
      mode: 'edit',
      repo: {
        id: 123,
        name: 'mi-repo-existente',
        description: 'Una descripcion',
        language: 'TypeScript',
        owner: {
          login: 'octocat',
          avatar_url: 'https://github.com/images/error/octocat_happy.gif'
        }
      }
    };

    const { container } = render(<Tab2 />);

    const nameInput = container.querySelector('ion-input');
    const saveButton = container.querySelector('ion-button');

    expect(nameInput).not.toBeNull();
    expect(saveButton).not.toBeNull();

    // Modify name via custom event for Ionic input
    fireEvent(nameInput!, new CustomEvent('ionInput', {
      detail: { value: 'repo-modificado' }
    }));

    // Click save
    fireEvent.click(saveButton!);

    await waitFor(() => {
      expect(updateRepository).toHaveBeenCalledWith('octocat', 'mi-repo-existente', {
        name: 'repo-modificado',
        description: 'Una descripcion'
      });
      expect(mockPush).toHaveBeenCalledWith('/tab1');
    });
  });
});
