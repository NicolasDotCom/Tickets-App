import { ImgHTMLAttributes } from 'react';

interface AppLogoIconProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
    className?: string;
}

export default function AppLogoIcon(props: AppLogoIconProps) {
    return (
        <img 
            {...props} 
            src="/images/logo.png" 
            alt="Logo de la empresa"
            className={`object-contain ${props.className || ''}`}
        />
    );
}
