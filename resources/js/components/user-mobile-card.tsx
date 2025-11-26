import { UserWithRoles } from '@/types';
import { Badge } from '@/components/ui/badge';

interface UserMobileCardProps {
    user: UserWithRoles;
    onViewDetails: (user: UserWithRoles) => void;
}

const translateRole = (roleName: string) => {
    const translations: { [key: string]: string } = {
        'admin': 'Administrador',
        'customer': 'Cliente',
        'support': 'Soporte Técnico',
        'comercial': 'Comercial'
    };
    return translations[roleName] || roleName;
};

const getRoleBadgeColor = (roleName: string) => {
    const colors: { [key: string]: string } = {
        'admin': 'bg-red-100 text-red-700',
        'customer': 'bg-blue-100 text-blue-700',
        'support': 'bg-green-100 text-green-700',
        'comercial': 'bg-purple-100 text-purple-700'
    };
    return colors[roleName] || 'bg-gray-100 text-gray-700';
};

export function UserMobileCard({ user, onViewDetails }: UserMobileCardProps) {
    return (
        <div 
            className="border rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onViewDetails(user)}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{user.name}</h3>
                    <p className="text-sm text-gray-600 break-all">{user.email}</p>
                </div>
                <span className="text-xs text-gray-400 ml-3 flex-shrink-0">#{user.id}</span>
            </div>

            <div className="space-y-3">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Roles</p>
                    <div className="flex flex-wrap gap-2">
                        {user.roles.map((role) => (
                            <span
                                key={role.id}
                                className={`text-sm font-medium px-3 py-1.5 rounded-full ${getRoleBadgeColor(role.name)}`}
                            >
                                {translateRole(role.name)}
                            </span>
                        ))}
                    </div>
                </div>

                {user.email_verified_at && (
                    <div className="flex items-center gap-2 text-sm text-green-600 pt-2 border-t">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Email verificado</span>
                    </div>
                )}
            </div>
        </div>
    );
}
