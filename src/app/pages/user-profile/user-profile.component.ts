import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  profilePictureUrl: string | ArrayBuffer | null = 'assets/images/default-avatar.png'; // Caminho para uma imagem padrão

  constructor(
    private fb: FormBuilder
    // private userService: UserService,
    // private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    // Carregar dados do usuário aqui (ex: this.loadUserProfile())
  }

  initializeForm(): void {
    this.profileForm = this.fb.group({
      location: [''], // Campo para localidade
      bio: ['']       // Campo para biografia
      // Adicione outros campos conforme necessário
    });
  }

  loadUserProfile(): void {
    // Lógica para buscar dados do usuário do backend (usando um UserService)
    // Exemplo:
    // this.userService.getCurrentUserProfile().subscribe(user => {
    //   this.profileForm.patchValue({
    //     location: user.location,
    //     bio: user.bio
    //   });
    //   this.profilePictureUrl = user.profilePictureUrl || 'assets/images/default-avatar.png';
    // });
    console.log("Carregando dados do perfil..."); // Placeholder
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      // Validar tipo e tamanho do arquivo aqui, se necessário

      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePictureUrl = reader.result;
        // Aqui você pode chamar um serviço para fazer upload da imagem
        // this.userService.uploadProfilePicture(file).subscribe(...)
        console.log("Nova imagem selecionada (pré-visualização)"); // Placeholder
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      const profileData = this.profileForm.value;
      // Lógica para salvar os dados do formulário (localidade, bio) no backend
      // Exemplo:
      // this.userService.updateUserProfile(profileData).subscribe({
      //   next: () => this.notificationService.showSuccess('Perfil atualizado com sucesso!'),
      //   error: (err) => this.notificationService.showError('Erro ao atualizar perfil.')
      // });
      console.log("Salvando perfil:", profileData); // Placeholder
    } else {
      console.warn("Formulário inválido");
      // this.notificationService.showWarning('Por favor, corrija os erros no formulário.');
    }
  }
}
