import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="bg-white dark:bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md border border-gray-200 dark:border-transparent">
                <AppLogoIcon className="size-5 fill-current text-black dark:text-white" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">TickeTes</span>
                <span className="truncate text-xs text-muted-foreground">TES LTDA</span>
            </div>
        </>
    );
}
