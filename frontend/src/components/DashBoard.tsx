function DashBoard() {
  return (
      <div className="container py-5">
        <h1 className="text-center mb-5 display-5">Welcome! Tap a mode to begin</h1>
  
        <div className="d-flex flex-column gap-5 align-items-center">
          <div
            className="card text-center shadow-lg w-100 p-4"
            style={{ maxWidth: '600px', minHeight: '200px', cursor: 'pointer' }}
            //onClick={() => handleNavigation('/ezmode')}
            role="button"
          >
            <div className="card-body">
              <div style={{ fontSize: '4rem' }}>🎙️</div>
              <h2 className="card-title mt-3 fw-bold">EZMode – Ask a Question</h2>
              <p className="card-text fs-4">Talk and get help instantly</p>
            </div>
          </div>
  
          <div
            className="card text-center shadow-lg w-100 p-4"
            style={{ maxWidth: '600px', minHeight: '200px', cursor: 'pointer' }}
            //onClick={() => handleNavigation('/ask-grandkid')}
            role="button"
          >
            <div className="card-body">
              <div style={{ fontSize: '4rem' }}>👨‍👩‍👧</div>
              <h2 className="card-title mt-3 fw-bold">Ask Grandkid</h2>
              <p className="card-text fs-4">Send your issue and get help from family</p>
            </div>
          </div>
  
          <div
            className="card text-center shadow-lg w-100 p-4"
            style={{ maxWidth: '600px', minHeight: '200px', cursor: 'pointer' }}
            //onClick={() => handleNavigation('/taptutor')}
            role="button"
          >
            <div className="card-body">
              <div style={{ fontSize: '4rem' }}>📖</div>
              <h2 className="card-title mt-3 fw-bold">TapTutor</h2>
              <p className="card-text fs-4">Step-by-step tutorials for common tasks</p>
            </div>
          </div>
        </div>
      </div>
    );
}

export default DashBoard;
