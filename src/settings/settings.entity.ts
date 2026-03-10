import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'Zone Cell' })
  companyName: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: 'Terima kasih atas kunjungan Anda' })
  footerText: string;

  @Column({ default: 5 })
  minStockAlert: number;

  @Column({ nullable: true, type: 'text' })
  logo: string;

  @Column({ nullable: true, type: 'text' })
  qrisImage: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;
}
