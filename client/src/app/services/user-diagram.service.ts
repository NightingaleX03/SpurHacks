import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService, User } from './auth.service';

export interface UserDiagram {
    id: string;
    name: string;
    description: string;
    type: string;
    mermaid_code: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserDiagramService {
    private userDiagrams = new BehaviorSubject<{ [userId: string]: UserDiagram[] }>({});

    constructor(private http: HttpClient, private authService: AuthService) {
        this.loadUserDiagrams();
    }

    private loadUserDiagrams() {
        this.http.get<any>('assets/data/sample-data.json').subscribe(data => {
            this.userDiagrams.next(data.user_diagrams || {});
        });
    }

    getUserDiagrams(): Observable<UserDiagram[]> {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
            return new BehaviorSubject<UserDiagram[]>([]).asObservable();
        }
        const diagrams = new BehaviorSubject<UserDiagram[]>([]);
        this.userDiagrams.subscribe(allDiagrams => {
            diagrams.next(allDiagrams[currentUser.id] || []);
        });
        return diagrams.asObservable();
    }

    addDiagram(diagram: UserDiagram) {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) return;

        const currentDiagrams = this.userDiagrams.getValue();
        const userDiagrams = currentDiagrams[currentUser.id] || [];
        userDiagrams.push(diagram);
        currentDiagrams[currentUser.id] = userDiagrams;
        this.userDiagrams.next(currentDiagrams);
    }
} 