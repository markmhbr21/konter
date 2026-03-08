export class CreateBranchDto {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export class UpdateBranchDto {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}
