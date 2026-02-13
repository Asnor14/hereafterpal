export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    payment_method: 'gcash' | 'maya' | 'bank_transfer';
    reference_no: string;
    proof_url?: string;
    created_at: string;
    updated_at: string;
}

export interface Subscription {
    id: string;
    user_id: string;
    plan: 'free' | 'eternal_echo' | 'paws_but_not_forgotten';
    status: 'active' | 'cancelled' | 'expired' | 'trialing';
    start_date: string;
    end_date?: string;
    auto_renew: boolean;
    created_at: string;
}

export interface AdminUser {
    id: string;
    email: string;
    plan: string;
    status: 'Active' | 'Pending' | 'Suspended';
    storageUsed: string;
    lastLogin: string;
    joinedDate: string;
}
